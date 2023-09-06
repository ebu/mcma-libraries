import { SecretsProvider } from "@mcma/secrets";
import { DefaultAzureCredential, TokenCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { getKeyVaultUrl } from "./config-variables-ext";

export interface AzureKeyVaultSecretsProviderConfig {
    keyVaultUrl?: string;
    credentials?: TokenCredential;
    client?: SecretClient;
}

export class AzureKeyVaultSecretsProvider extends SecretsProvider {

    constructor(private readonly config?: AzureKeyVaultSecretsProviderConfig) {
        super();

        if (!this.config) {
            this.config = {};
        }
        if (!this.config.client) {
            if (!this.config.keyVaultUrl) {
                this.config.keyVaultUrl = getKeyVaultUrl();
            }
            if (!this.config.credentials) {
                this.config.credentials = new DefaultAzureCredential();
            }
            this.config.client = new SecretClient(this.config.keyVaultUrl, this.config.credentials);
        }
    }

    async get(secretId: string): Promise<string> {
        const secret = await this.config.client.getSecret(secretId);
        return secret.value;
    }
}
