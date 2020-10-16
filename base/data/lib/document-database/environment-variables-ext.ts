import { EnvironmentVariables } from "@mcma/core";

export function getTableName(environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()): string {
    return environmentVariables.get("TableName");
}
