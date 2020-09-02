import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";
import { CosmosClient, Database, Container, ContainerDefinition } from "@azure/cosmos";

import { CosmosDbTable } from "./cosmos-db-table";
import { CosmosDbTableProviderOptions } from "./cosmos-db-table-provider-options";

export class CosmosDbTableProvider implements DocumentDatabaseTableProvider {
    private cosmosClient: CosmosClient;
    private database: Database;
    private containers: { [key: string]: { containerDefinition: ContainerDefinition, container: Container } };

    constructor(private options: CosmosDbTableProviderOptions) {
        this.cosmosClient = new CosmosClient({ endpoint: options.endpoint, key: options.key });
        this.database = this.cosmosClient.database(this.options.databaseId);
    }

    async get(tableName: string): Promise<DocumentDatabaseTable> {
        if (!this.containers[tableName]) {
            const containerResp = await this.database.container(tableName).read();
            this.containers[tableName] = {
                container: containerResp.container,
                containerDefinition: containerResp.resource
            };
        }
        return new CosmosDbTable(this.containers[tableName].container, this.containers[tableName].containerDefinition, this.options.customQueries);
    }
}