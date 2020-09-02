import { AuthTypeRegistration } from "@mcma/client";
import { AzureFunctionKeyAuthContext } from "./function-key-auth-context";
import { AzureFunctionKeyAuthenticator } from "./function-key-authenticator";

export function azureFunctionKeyAuth(decryptionKey?: string): AuthTypeRegistration<AzureFunctionKeyAuthContext> {
    return {
        authType: "AzureFunctionKey",
        authenticatorFactory: (authContext: AzureFunctionKeyAuthContext) => new AzureFunctionKeyAuthenticator(authContext, decryptionKey)
    };
}
