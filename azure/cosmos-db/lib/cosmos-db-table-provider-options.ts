import { ConfigVariables } from "@mcma/core";
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

export function fillOptionsFromConfigVariables(
    options: CosmosDbTableProviderOptions = emptyCosmosDbSettings(),
    configVariables: ConfigVariables = ConfigVariables.getInstance()
): CosmosDbTableProviderOptions {
    options.endpoint = configVariables.get("MCMA_COSMOS_DB_ENDPOINT");
    options.key = configVariables.get("MCMA_COSMOS_DB_KEY");
    options.region = configVariables.get("MCMA_COSMOS_DB_REGION");
    options.databaseId = configVariables.get("MCMA_COSMOS_DATABASE_ID");
    options.customQueries = {};
    return options;
}
