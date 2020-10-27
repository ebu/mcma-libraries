import { ConfigVariables } from "@mcma/core";

export function getTableName(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("TableName");
}
