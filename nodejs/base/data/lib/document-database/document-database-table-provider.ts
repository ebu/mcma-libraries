import { DocumentDatabaseTable } from "./document-database-table";

export interface DocumentDatabaseTableProvider {
    get<TPartitionKey = string, TSortKey = string>(tableName: string): Promise<DocumentDatabaseTable<TPartitionKey, TSortKey>>;
}