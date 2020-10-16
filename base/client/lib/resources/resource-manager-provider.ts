import { EnvironmentVariables, McmaException } from "@mcma/core";

import { AuthProvider } from "../auth";
import { ResourceManagerConfig } from "./resource-manager-config";
import { ResourceManager } from "./resource-manager";
import { getResourceManagerConfig } from "./environment-variables-ext";

export class ResourceManagerProvider {
    constructor(private authProvider: AuthProvider, private defaultConfig?: ResourceManagerConfig) {
    }

    get(config?: ResourceManagerConfig | EnvironmentVariables) {
        config = config || this.defaultConfig;
        if (!config) {
            config = EnvironmentVariables.getInstance();
        }
        if (config instanceof EnvironmentVariables) {
            config = getResourceManagerConfig(config);
        }
        if (!config) {
            throw new McmaException("Config for resource manager not provided, and there is no default config available");
        }
        return new ResourceManager(config, this.authProvider);
    }
}
