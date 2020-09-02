import { ContextVariableProvider } from "@mcma/core";
import { CustomQuery } from "@mcma/data";
import { SqlQuerySpec } from "@azure/cosmos";

const Prefix = "CosmosDb";

export type CustomQueryFactory = (customQuery: CustomQuery) => SqlQuerySpec;
export type CustomQueryRegistry = { [key: string]: CustomQueryFactory };

export interface CosmosDbTableProviderOptions {
    endpoint: string;
    key: string;
    region: string;
    databaseId: string;
    customQueries: CustomQueryRegistry;
}

function emptyCosmosDbSettings(): CosmosDbTableProviderOptions {
    return {
        endpoint: null,
        key: null,
        region: null,
        databaseId: null,
        customQueries: {}
    };
}

export function fillOptionsFromEnvironmentVariables(options: CosmosDbTableProviderOptions): CosmosDbTableProviderOptions {
    for (let prop of Object.keys(options)) {
        // @ts-ignore
        options[prop] = process.env[Prefix + prop];
    }
    return options;
}

export function fillOptionsFromContextVariableProvider(
    options: CosmosDbTableProviderOptions,
    contextVariableProvider: ContextVariableProvider
): CosmosDbTableProviderOptions {
    for (let prop of Object.keys(options)) {
        // @ts-ignore
        options[prop] = contextVariableProvider.getRequiredContextVariable[Prefix + prop];
    }
    return options;
}

export function getOptionsFromEnvironmentVariables(): CosmosDbTableProviderOptions {
    return fillOptionsFromEnvironmentVariables(emptyCosmosDbSettings());
}

export function getOptionsFromContextVariableProvider(contextVariableProvider: ContextVariableProvider): CosmosDbTableProviderOptions {
    return fillOptionsFromContextVariableProvider(emptyCosmosDbSettings(), contextVariableProvider);
}