import { EnvironmentVariables } from "@mcma/core";
import { CustomQuery } from "@mcma/data";
import { SqlQuerySpec } from "@azure/cosmos";

export type CustomQueryFactory = (customQuery: CustomQuery) => SqlQuerySpec;
export type CustomQueryRegistry = { [key: string]: CustomQueryFactory };

export interface CosmosDbTableProviderOptions {
    endpoint: string;
    key: string;
    region: string;
    databaseId: string;
    customQueries?: CustomQueryRegistry;
}

function emptyCosmosDbSettings(): CosmosDbTableProviderOptions {
    return {
        endpoint: null,
        key: null,
        region: null,
        databaseId: null
    };
}

export function fillOptionsFromEnvironmentVariables(
    options: CosmosDbTableProviderOptions = emptyCosmosDbSettings(),
    environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()
): CosmosDbTableProviderOptions {
    options.endpoint = environmentVariables.get("CosmosDbEndpoint");
    options.key = environmentVariables.get("CosmosDbKey");
    options.region = environmentVariables.get("CosmosDbRegion");
    options.databaseId = environmentVariables.get("CosmosDbDatabaseId");
    options.customQueries = {};
    return options;
}
