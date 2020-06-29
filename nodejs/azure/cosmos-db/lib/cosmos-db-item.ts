import { Document } from "@mcma/data";

export interface CosmosDbItem<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> {
    partitionKey: TPartitionKey;
    sortKey: TSortKey;
    resource: TDocument;
}

export class CosmosDbItem<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> {
    constructor(partitionKey: TPartitionKey, sortKey: TSortKey, resource: TDocument) {
        if (resource) {
            this.partitionKey = partitionKey;
            this.sortKey = sortKey;
            this.resource = resource;
        }
    }
}