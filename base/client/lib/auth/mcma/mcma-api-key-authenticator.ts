import { HttpRequestConfig } from "../../http";
import { Authenticator } from "../authenticator";
import { McmaApiKeyAuthenticatorConfig } from "./mcma-api-key-authenticator-config";
import { getApiKeySecretId } from "./config-variables-ext";
import { McmaException } from "@mcma/core";

export class McmaApiKeyAuthenticator implements Authenticator {
    constructor(private config: McmaApiKeyAuthenticatorConfig) {
        if (!this.config.apiKey) {
            if (!this.config.secretsProvider) {
                throw new McmaException("McmaAuthenticatorConfig misses property 'secretsProvider'");
            }
            if (!this.config.apiKeySecretId) {
                this.config.apiKeySecretId = getApiKeySecretId();
            }
        }
    }

    async sign(config: HttpRequestConfig): Promise<void> {
        if (!this.config.apiKey) {
            this.config.apiKey = await this.config.secretsProvider.get(this.config.apiKeySecretId);
        }

        if (!config.headers) {
            config.headers = {};
        }
        config.headers["x-mcma-api-key"] = this.config.apiKey;
    }
}
