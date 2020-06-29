import { McmaResource } from "@mcma/core";
import { Document } from "./document";

export interface DocumentDatabaseTableConfig<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> {
    getPartitionKey: (doc: TDocument) => TPartitionKey;
    partitionKeyName: string;

    getSortKey?: (doc: TDocument) => TSortKey;
    sortKeyName?: string;
}

export function getDefaultMcmaResourceTableConfig<T extends McmaResource>(): DocumentDatabaseTableConfig<T> {
    return {
        getPartitionKey: (resource: T) => resource["@type"],
        partitionKeyName: "resource_type",
        getSortKey: (resource: T) => resource.id,
        sortKeyName: "resource_id"
    };
}
