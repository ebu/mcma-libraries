import { ResourceManagerConfig } from "./resource-manager-config";
import { EnvironmentVariables } from "@mcma/core";

export function getResourceManagerConfig(environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()): ResourceManagerConfig {
    return {
        servicesUrl: environmentVariables.get("ServicesUrl"),
        servicesAuthType: environmentVariables.getOptional("ServicesAuthType"),
        servicesAuthContext: environmentVariables.getOptional("ServicesAuthContext"),
    };
}
