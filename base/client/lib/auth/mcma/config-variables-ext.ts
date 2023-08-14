import { ConfigVariables } from "@mcma/core";

export function getApiKeySecretId(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("MCMA_API_KEY_SECRET_ID");
}
