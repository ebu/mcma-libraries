import { DocumentDatabaseFilterExpression } from "./document-database-filter-expression";
import { Document } from "./document";

export interface DocumentDatabaseQuery<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> {
    pageNumber?: number;
    pageSize?: number;
    partitionKey?: TPartitionKey;
    sortKey?: TSortKey;
    filter?: DocumentDatabaseFilterExpression<TDocument>;
}
