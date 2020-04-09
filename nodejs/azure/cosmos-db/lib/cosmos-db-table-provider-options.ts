import { ContextVariableProvider, McmaResourceType, McmaResource, Utils } from "@mcma/core";

const Prefix = "CosmosDb";

export function fillOptionsFromEnvironmentVariables(options: CosmosDbTableProviderOptions): CosmosDbTableProviderOptions {
    for (let prop of Object.keys(options)) {
        options[prop] = process.env[Prefix + prop];
    }
    return options;
}

export function fillOptionsFromContextVariableProvider(
    options: CosmosDbTableProviderOptions,
    contextVariableProvider: ContextVariableProvider
): CosmosDbTableProviderOptions {
    for (let prop of Object.keys(options)) {
        options[prop] = contextVariableProvider.getRequiredContextVariable[Prefix + prop];
    }
    return options;
}

export class CosmosDbTableProviderOptions {
    endpoint: string = null;
    key: string = null;
    region: string = null;
    databaseId: string = null;
    partitionKeySelectors: { [type: string]: (x: any) => string } = {};

    addPartitionKeySelector<T extends McmaResource>(type: McmaResourceType<T>, partitionKeySelector: (x: T) => string): this {
        this.partitionKeySelectors[Utils.getTypeName(type)] = partitionKeySelector;
        return this;
    }

    static fromEnvironmentVariables(): CosmosDbTableProviderOptions {
        return fillOptionsFromEnvironmentVariables(new CosmosDbTableProviderOptions());
    }

    static fromContextVariableProvider(contextVariableProvider: ContextVariableProvider): CosmosDbTableProviderOptions {
        return fillOptionsFromContextVariableProvider(new CosmosDbTableProviderOptions(), contextVariableProvider);
    }
}