import { ConfigVariables } from "@mcma/core";

export function getPublicUrl(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("MCMA_PUBLIC_URL");
}

export function getApiSecurityConfigSecretId(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("MCMA_API_KEY_SECURITY_CONFIG_SECRET_ID");
}
