import { ContextVariableProvider } from "@mcma/core";
import { ResourceManagerConfig } from "./resource-manager-config";

export function getResourceManagerConfig(contextVariableProvider: ContextVariableProvider): ResourceManagerConfig {
    return {
        servicesUrl: contextVariableProvider.getRequiredContextVariable("ServicesUrl"),
        servicesAuthType: contextVariableProvider.getOptionalContextVariable("ServicesAuthType"),
        servicesAuthContext: contextVariableProvider.getOptionalContextVariable("ServicesAuthContext")
    };
};