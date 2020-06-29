import { DocumentDatabaseTable, DocumentDatabaseTableConfig, DocumentType, Document, DocumentDatabaseQuery } from "@mcma/data";
import { CosmosClient, Container } from "@azure/cosmos";
import { CosmosDbFilter } from "./cosmos-db-filter";
import { CosmosDbItem } from "./cosmos-db-item";
import { McmaException } from "@mcma/core";

export class CosmosDbTable<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> extends DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey> {
    private containerPromise: Promise<Container>;

    constructor(
        private tableName: string,
        type: DocumentType<TDocument>,
        private config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>,
        private cosmosClient: CosmosClient,
        private databaseId: string
    ) {
        super(type);
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

    async query(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]> {
        const container = await this.getContainer();

        const filter = new CosmosDbFilter<TDocument>(query.filter);

        const queryIterator = container.items.query<CosmosDbItem<TDocument>>(filter.toSqlQuerySpec());

        const resp = await queryIterator.fetchAll();

        return resp.resources.map(x => x.resource);
    }
    
    async get(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<TDocument> {
        if (!sortKey) {
            throw new McmaException("Sort key was not provided.");
        }

        const container = await this.getContainer();

        const resp = await container.item(sortKey.toString(), partitionKey).read<CosmosDbItem<TDocument>>();
        if (resp.statusCode === 404) {
            return null;
        }

        return resp.resource.resource;
    }
    
    async put(resource: TDocument): Promise<TDocument> {

        const container = await this.getContainer();

        const partitionKey = this.config.getPartitionKey(resource);
        const sortKey = this.config.getSortKey(resource);
        if (!sortKey) {
            throw new McmaException("Sort key is not set on resource.");
        }

        const item = new CosmosDbItem<TDocument, TPartitionKey>(partitionKey, sortKey.toString(), resource);

        const resp = await container.items.upsert<CosmosDbItem<TDocument, TPartitionKey>>(item);

        return resp.resource.resource;
    }
    
    async delete(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<void> {
        if (!sortKey) {
            throw new McmaException("Sort key was not provided.");
        }

        const container = await this.getContainer();
        await container.item(sortKey.toString(), partitionKey).delete();
    }
}