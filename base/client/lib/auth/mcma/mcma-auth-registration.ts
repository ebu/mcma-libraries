import { AuthTypeRegistration } from "../auth-type-registration.js";
import { McmaApiKeyAuthenticator } from "./mcma-api-key-authenticator.js";
import { McmaApiKeyAuthenticatorConfig } from "./mcma-api-key-authenticator-config.js";

export function mcmaApiKeyAuth(config: McmaApiKeyAuthenticatorConfig): AuthTypeRegistration {
    return {
        authType: "McmaApiKey",
        authenticator: new McmaApiKeyAuthenticator(config),
    };
}
