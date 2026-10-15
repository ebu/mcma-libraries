import { ResourceManagerConfig } from "./resource-manager-config.js";
import { ConfigVariables } from "@mcma/core";

export function getResourceManagerConfig(configVariables: ConfigVariables = ConfigVariables.getInstance()): ResourceManagerConfig {
    return {
        serviceRegistryUrl: configVariables.get("MCMA_SERVICE_REGISTRY_URL"),
        serviceRegistryAuthType: configVariables.getOptional("MCMA_SERVICE_REGISTRY_AUTH_TYPE"),
    };
}
