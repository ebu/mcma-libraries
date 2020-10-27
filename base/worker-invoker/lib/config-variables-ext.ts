import { ConfigVariables } from "@mcma/core";

export function getWorkerFunctionId(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("WorkerFunctionId");
}
