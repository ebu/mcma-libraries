import { DocumentDatabaseTable, Document, Query } from "@mcma/data";
import { Container, ContainerDefinition } from "@azure/cosmos";
import { CosmosDbFilter } from "./cosmos-db-filter";
import { McmaException } from "@mcma/core";

function parsePartitionKey(id: string): string {
    const lastSlashIndex = id.lastIndexOf("/");
    return lastSlashIndex > 0 ? id.substr(0, lastSlashIndex) : null;
}

export class CosmosDbTable implements DocumentDatabaseTable {

    private readonly partitionKeyName: string;

    constructor(private container: Container, containerDefinition: ContainerDefinition) {
        if (containerDefinition.partitionKey.paths.length > 1) {
            throw new McmaException(`Container ${containerDefinition.id} defines a partition key with multiple paths. MCMA only supports partition keys with a single path.`);
        }
        
        this.partitionKeyName = containerDefinition.partitionKey.paths[0].substr(1);
    }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<TDocument[]> {
        const filter = new CosmosDbFilter<TDocument>(query, this.partitionKeyName);

        const queryIterator = this.container.items.query(filter.toSqlQuerySpec());

        const resp = await queryIterator.fetchAll();

        return resp.resources.map(x => x.resource);
    }
    
    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        const resp = await this.container.item(id, parsePartitionKey(id)).read();
        if (resp.statusCode === 404) {
            return null;
        }

        return resp.resource.resource;
    }
    
    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        const item = {
            id,
            [this.partitionKeyName]: parsePartitionKey(id),
            resource
        };

        const resp = await this.container.items.upsert(item);

        return resp.resource.resource;
    }
    
    async delete(id: string): Promise<void> {
        await this.container.item(id, parsePartitionKey(id)).delete();
    }
}