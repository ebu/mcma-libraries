import { AuthTypeRegistration } from "@mcma/client";
import { AzureFunctionKeyAuthContext } from "./function-key-auth-context";
import { AzureFunctionKeyAuthenticator } from "./function-key-authenticator";

export const azureFunctionKeyAuth = (decryptionKey?: string): AuthTypeRegistration<AzureFunctionKeyAuthContext> => ({
    authType: "AzureFunctionKey",
    authenticatorFactory: (authContext: AzureFunctionKeyAuthContext) => new AzureFunctionKeyAuthenticator(authContext, decryptionKey)
});