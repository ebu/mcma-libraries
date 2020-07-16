import { DocumentDatabaseTable } from "./document-database-table";

export interface DocumentDatabaseTableProvider {
    get(tableName: string): Promise<DocumentDatabaseTable>;
}