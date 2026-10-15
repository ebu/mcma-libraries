import { AuthTypeRegistration } from "@mcma/client";
import { AzureFunctionKeyAuthContext } from "./function-key-auth-context.js";
import { AzureFunctionKeyAuthenticator } from "./function-key-authenticator.js";

export function azureFunctionKeyAuth(authContext: AzureFunctionKeyAuthContext, decryptionKey?: string): AuthTypeRegistration {
    return {
        authType: "AzureFunctionKey",
        authenticator: new AzureFunctionKeyAuthenticator(authContext, decryptionKey)
    };
}
