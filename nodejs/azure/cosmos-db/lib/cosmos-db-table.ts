import { McmaResource, McmaResourceType, McmaException } from "@mcma/core";
import { DbTable } from "@mcma/data";
import { CosmosClient, Container, Database, extractPartitionKey, SqlQuerySpec } from "@azure/cosmos";
import { SqlBuilder } from "./cosmos-db-sql-builder";
import { CosmosDbItem } from "./cosmos-db-item";

export class CosmosDbTable<T extends McmaResource> extends DbTable<T> {
    private containerPromise: Promise<Container>;

    constructor(
        type: McmaResourceType<T>,
        private cosmosClient: CosmosClient,
        private databaseId: string,
        private tableName: string,
        private partitionKeySelector: (x: T) => string
    ) {
        super(type);

        if (!partitionKeySelector) {
            this.partitionKeySelector = x => x["@type"];
        }
    }

    private async getContainer(): Promise<Container> {
        if (!this.containerPromise) {
            const dbResp = await this.cosmosClient.databases.createIfNotExists({ id: this.databaseId });
            
            this.containerPromise =
                dbResp.database.containers.createIfNotExists({
                    id: this.tableName,
                    partitionKey: { paths: ["partitionKey"] }
                })
                .then(containerResp => containerResp.container);
        }
        return await this.containerPromise;
    }

    async query(filter: (resource: T) => boolean): Promise<T[]> {
        const container = await this.getContainer();

        const sqlBuilder = new SqlBuilder<T>(this.type);
        sqlBuilder.addFilter(filter);

        const queryIterator = container.items.query<CosmosDbItem<T>>(sqlBuilder.toSqlQuerySpec());

        const resp = await queryIterator.fetchAll();

        return resp.resources.map(x => x.resource);
    }
    
    async get(id: string): Promise<T> {
        const container = await this.getContainer();

        const resp = await container.item(id).read<CosmosDbItem<T>>();
        if (resp.statusCode === 404) {
            return null;
        }

        return resp.resource.resource;
    }
    
    async put(id: string, resource: T): Promise<T> {
        if (resource.id !== id) {
            resource.id = id;
        }

        const container = await this.getContainer();

        const item = new CosmosDbItem<T>(resource, this.partitionKeySelector(resource));

        const resp = await container.items.upsert<CosmosDbItem<T>>(item);

        return resp.resource.resource;
    }
    
    async delete(id: string): Promise<void> {
        const container = await this.getContainer();

        await container.item(id).delete();
    }
}