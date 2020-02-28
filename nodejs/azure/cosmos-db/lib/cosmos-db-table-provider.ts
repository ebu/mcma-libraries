import { McmaResource, McmaResourceType, Utils } from "@mcma/core";
import { DbTableProvider, DbTable } from "@mcma/data";
import { CosmosClient, CosmosClientOptions } from "@azure/cosmos";

import { CosmosDbTable } from "./cosmos-db-table";
import { CosmosDbTableProviderOptions } from "./cosmos-db-table-provider-options";

export class CosmosDbTableProvider implements DbTableProvider {
    private cosmosClient: CosmosClient;

    constructor(private options: CosmosDbTableProviderOptions) {
        this.cosmosClient = new CosmosClient({ endpoint: options.endpoint, key: options.key });
    }

    get<T extends McmaResource>(type: McmaResourceType<T>, tableName: string): DbTable<T> {
        const typeName = Utils.getTypeName(type);
        const partitionKeySelector = this.options.partitionKeySelectors && this.options.partitionKeySelectors[typeName];
        return new CosmosDbTable<T>(type, this.cosmosClient, this.options.databaseId, tableName, partitionKeySelector);
    }
}