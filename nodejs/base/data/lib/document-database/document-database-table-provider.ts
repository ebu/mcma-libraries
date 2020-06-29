import { DocumentDatabaseTable } from "./document-database-table";
import { DocumentDatabaseTableConfig } from "./document-database-table-config";
import { Document } from "./document";
import { DocumentType } from "./document-type";
import { Utils, McmaException } from "@mcma/core";

export interface DocumentDatabaseTableProvider {
    configure<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        type: DocumentType<TDocument>,
        config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>
    ): this;

    get<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        tableName: string,
        type: DocumentType<TDocument>
    ): DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey>;
}

export abstract class DocumentDatabaseTableProvider implements DocumentDatabaseTableProvider {
    private configurations: { [key: string]: any } = {};

    isConfigured<TDocument extends Document = Document>(type: DocumentType<TDocument>): boolean {
        return !!this.configurations[Utils.getTypeName(type)];
    }

    configure<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        type: DocumentType<TDocument>,
        config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>,
        overwriteIfExisting = false
    ): this {
        const typeName = Utils.getTypeName(type);
        if (this.configurations[typeName] && !overwriteIfExisting) {
            throw new McmaException(`Document type ${typeName} has already been configured for this DocumentDatabaseTableProvider. If you would like overwrite the existing configuration, specify true for the optional overwriteIfExisting argument.`);
        }
        this.configurations[typeName] = config;
        return this;
    }

    get<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        tableName: string,
        type: DocumentType<TDocument>
    ): DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey> {
        const typeName = Utils.getTypeName(type);
        if (!this.configurations[typeName]) {
            throw new McmaException(`Type '${typeName}' does not have a configured partition key and/or sort key.`);
        }

        return this.getFromConfig<TDocument, TPartitionKey, TSortKey>(tableName, type, this.configurations[typeName]);
    }

    protected abstract getFromConfig<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        tableName: string,
        type: DocumentType<TDocument>,
        config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>
    ): DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey>;
}