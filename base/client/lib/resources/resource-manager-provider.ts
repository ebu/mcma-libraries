import { ContextVariableProvider, McmaException } from "@mcma/core";
import { AuthProvider } from "../auth";

import { ResourceManagerConfig } from "./resource-manager-config";
import { ResourceManager } from "./resource-manager";
import { getResourceManagerConfig } from "./context-variable-provider-ext";


export class ResourceManagerProvider {
    constructor(private authProvider: AuthProvider, private defaultConfig?: ResourceManagerConfig) { }

    private isContextVariableProvider(configOrVariableProvider: ResourceManagerConfig | ContextVariableProvider): configOrVariableProvider is ContextVariableProvider {
        return (configOrVariableProvider as any).getRequiredContextVariable !== undefined;
    }

    get(config?: ResourceManagerConfig | ContextVariableProvider) {
        config = config || this.defaultConfig;
        if (!config) {
            throw new McmaException("Config for resource manager not provided, and there is no default config available");
        }
        if (this.isContextVariableProvider(config)) {
            config = getResourceManagerConfig(config);
        }
        return new ResourceManager(config, this.authProvider);
    }
}
