import { AuthTypeRegistration } from "../auth-type-registration";
import { McmaApiKeyAuthenticator } from "./mcma-api-key-authenticator";
import { McmaApiKeyAuthenticatorConfig } from "./mcma-api-key-authenticator-config";

export function mcmaApiKeyAuth(config: McmaApiKeyAuthenticatorConfig): AuthTypeRegistration {
    return {
        authType: "McmaApiKey",
        authenticator: new McmaApiKeyAuthenticator(config),
    };
}
