import { DocumentDatabaseQuery } from "./document-database-query";
import { Document } from "./document";

export abstract class DocumentDatabaseTable<TPartitionKey = string, TSortKey = string> {
    
    abstract query<TDocument extends Document = Document>(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]>;

    abstract get<TDocument extends Document = Document>(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<TDocument>;

    abstract put<TDocument extends Document = Document>(partitionKey: TPartitionKey, sortKey: TSortKey, resource: TDocument): Promise<TDocument>;

    abstract delete(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<void>
}