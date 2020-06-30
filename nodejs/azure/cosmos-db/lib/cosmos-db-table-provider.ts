import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";
import { CosmosClient, Database, Container } from "@azure/cosmos";

import { CosmosDbTable } from "./cosmos-db-table";
import { CosmosDbTableProviderOptions } from "./cosmos-db-table-provider-options";

export class CosmosDbTableProvider implements DocumentDatabaseTableProvider {
    private cosmosClient: CosmosClient;
    private database: Database;
    private containers: { [key: string]: Container };

    constructor(private options: CosmosDbTableProviderOptions) {
        this.cosmosClient = new CosmosClient({ endpoint: options.endpoint, key: options.key });
    }

    async get<TPartitionKey = string, TSortKey = string>(tableName: string): Promise<DocumentDatabaseTable<TPartitionKey, TSortKey>> {
        if (!this.containers[tableName]) {
            if (!this.database) {
                this.database = (await this.cosmosClient.database(this.options.databaseId).read()).database;
            }
            this.containers[tableName] = (await this.database.container(tableName).read()).container;
        }
        return new CosmosDbTable<TPartitionKey, TSortKey>(this.containers[tableName]);
    }
}