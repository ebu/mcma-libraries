import { SecretsProvider } from "@mcma/secrets";

export interface McmaApiKeyAuthenticatorConfig {
    apiKey?: string;
    apiKeySecretId?: string;
    secretsProvider?: SecretsProvider
}
