import { EnvironmentVariables } from "@mcma/core";

export function getWorkerFunctionId(environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()): string {
    return environmentVariables.get("WorkerFunctionId");
}
