import { DocumentDatabaseTable, Document, DocumentDatabaseQuery } from "@mcma/data";
import { CosmosClient, Container } from "@azure/cosmos";
import { CosmosDbFilter } from "./cosmos-db-filter";
import { CosmosDbItem } from "./cosmos-db-item";
import { McmaException } from "@mcma/core";

export class CosmosDbTable<TPartitionKey = string, TSortKey = string> extends DocumentDatabaseTable<TPartitionKey, TSortKey> {

    constructor(private container: Container) {
        super();
    }


    async query<TDocument extends Document = Document>(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]> {
        const filter = new CosmosDbFilter<TDocument>(query.filter);

        const queryIterator = this.container.items.query<CosmosDbItem<TDocument>>(filter.toSqlQuerySpec());

        const resp = await queryIterator.fetchAll();

        return resp.resources.map(x => x.resource);
    }
    
    async get<TDocument extends Document = Document>(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<TDocument> {
        if (!sortKey) {
            throw new McmaException("Sort key was not provided.");
        }

        const resp = await this.container.item(sortKey.toString(), partitionKey).read<CosmosDbItem<TDocument>>();
        if (resp.statusCode === 404) {
            return null;
        }

        return resp.resource.resource;
    }
    
    async put<TDocument extends Document = Document>(partitionKey: TPartitionKey, sortKey: TSortKey, resource: TDocument): Promise<TDocument> {
        if (!sortKey) {
            throw new McmaException("Sort key was not provided.");
        }

        const item = new CosmosDbItem<TDocument, TPartitionKey>(partitionKey, sortKey.toString(), resource);

        const resp = await this.container.items.upsert<CosmosDbItem<TDocument, TPartitionKey>>(item);

        return resp.resource.resource;
    }
    
    async delete(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<void> {
        if (!sortKey) {
            throw new McmaException("Sort key was not provided.");
        }

        await this.container.item(sortKey.toString(), partitionKey).delete();
    }
}