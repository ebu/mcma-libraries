import { ConfigVariables } from "@mcma/core";

export function getLogGroupName(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("MCMA_LOG_GROUP_NAME");
}
