import { ContextVariableProvider, EnvironmentVariableProvider } from "@mcma/core";
import { CustomQuery } from "@mcma/data";
import { SqlQuerySpec } from "@azure/cosmos";

const Prefix = "CosmosDb";
const environmentVariableProvider = new EnvironmentVariableProvider();

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

export function fillOptionsFromEnvironmentVariables(options?: CosmosDbTableProviderOptions): CosmosDbTableProviderOptions {
    return fillOptionsFromContextVariableProvider(environmentVariableProvider, options);
}

export function fillOptionsFromContextVariableProvider(
    contextVariableProvider: ContextVariableProvider,
    options?: CosmosDbTableProviderOptions
): CosmosDbTableProviderOptions {
    options = Object.assign(emptyCosmosDbSettings(), options ?? {});
    for (let prop of Object.keys(options)) {
        // @ts-ignore
        options[prop] = contextVariableProvider.getRequiredContextVariable(Prefix + prop);
    }
    options.customQueries = {};
    return options;
}