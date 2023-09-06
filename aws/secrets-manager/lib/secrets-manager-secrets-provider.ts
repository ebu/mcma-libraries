import { SecretsProvider } from "@mcma/secrets";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export interface AwsSecretsManagerSecretsProviderConfig {
    client?: SecretsManagerClient;
}

export class AwsSecretsManagerSecretsProvider extends SecretsProvider {

    constructor(private config?: AwsSecretsManagerSecretsProviderConfig) {
        super();

        if (!config) {
            this.config = {};
        }
        if (!this.config.client) {
            this.config.client = new SecretsManagerClient({});
        }
    }

    async get(secretId: string): Promise<string> {
        const secretValue = await this.config.client.send(new GetSecretValueCommand({ SecretId: secretId }));
        return secretValue.SecretString;
    }
}
