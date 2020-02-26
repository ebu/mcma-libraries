import { ContextVariableProvider } from "@mcma/core";

export function getPublicUrl(contextVariableProvider: ContextVariableProvider): string {
    return contextVariableProvider.getRequiredContextVariable("PublicUrl");
}

export function getWorkerFunctionId(contextVariableProvider: ContextVariableProvider): string {
    return contextVariableProvider.getRequiredContextVariable("WorkerFunctionId");
}