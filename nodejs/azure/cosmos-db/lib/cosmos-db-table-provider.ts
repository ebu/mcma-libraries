import { DocumentDatabaseTableProvider, DocumentDatabaseTable, DocumentDatabaseTableConfig, DocumentType, Document } from "@mcma/data";
import { CosmosClient } from "@azure/cosmos";

import { CosmosDbTable } from "./cosmos-db-table";
import { CosmosDbTableProviderOptions } from "./cosmos-db-table-provider-options";

export class CosmosDbTableProvider extends DocumentDatabaseTableProvider {
    private cosmosClient: CosmosClient;

    constructor(private options: CosmosDbTableProviderOptions) {
        super();
        this.cosmosClient = new CosmosClient({ endpoint: options.endpoint, key: options.key });
    }
    
    protected getFromConfig<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string>(
        tableName: string,
        type: DocumentType<TDocument>,
        config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>
    ): DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey> {
        return new CosmosDbTable<TDocument, TPartitionKey, TSortKey>(tableName, type, config, this.cosmosClient, this.options.databaseId);
    }
}