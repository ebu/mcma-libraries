import { DocumentDatabaseTable } from "./document-database-table.js";

export interface DocumentDatabaseTableProvider {
    get(tableName: string): Promise<DocumentDatabaseTable>;
}