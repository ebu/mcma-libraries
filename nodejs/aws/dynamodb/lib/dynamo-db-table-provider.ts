import { DocumentDatabaseTableProvider, DocumentDatabaseTableConfig, DocumentType, Document } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";
import { DynamoDbTableOptions } from "./dynamo-db-table-options";

export class DynamoDbTableProvider extends DocumentDatabaseTableProvider {
    constructor(private options?: DynamoDbTableOptions) {
        super();
    }

    protected getFromConfig<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        tableName: string,
        type: DocumentType<TDocument>,
        config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>
    ) {
        return new DynamoDbTable<TDocument, TPartitionKey, TSortKey>(tableName, type, config, this.options);
    }
}
