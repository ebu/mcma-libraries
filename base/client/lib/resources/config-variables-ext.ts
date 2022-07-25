import { ResourceManagerConfig } from "./resource-manager-config";
import { ConfigVariables } from "@mcma/core";

export function getResourceManagerConfig(configVariables: ConfigVariables = ConfigVariables.getInstance()): ResourceManagerConfig {
    return {
        servicesUrl: configVariables.get("ServicesUrl"),
        servicesAuthType: configVariables.getOptional("ServicesAuthType"),
    };
}
