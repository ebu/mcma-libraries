import { Utils } from "@mcma/core";
import { DocumentDatabaseQuery } from "./document-database-query";
import { Document } from "./document";
import { DocumentType } from "./document-type";

export abstract class DocumentDatabaseTable<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> {
    protected type: string;

    protected constructor(type: DocumentType<TDocument>) {
        this.type = Utils.getTypeName(type);
    }

    abstract query(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]>;

    abstract get(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<TDocument>;

    abstract put(resource: TDocument): Promise<TDocument>;

    abstract delete(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<void>
}