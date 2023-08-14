import { ConfigVariables } from "@mcma/core";

export function getKeyVaultUrl(configVariables = ConfigVariables.getInstance()) {
    return configVariables.get("MCMA_KEY_VAULT_URL");
}
