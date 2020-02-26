import { AuthenticatorFactory } from "./authenticator-factory";
import { Authenticator } from "./authenticator";

export class AuthProvider {
    registeredAuthTypes: { [key: string]: AuthenticatorFactory } = {};

    add(authType: string, authenticatorFactory: AuthenticatorFactory): AuthProvider {
        if (Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === authType)) {
            throw new Error("Auth type '" + authType + "' has already been registered.");
        }
        if (typeof authenticatorFactory !== "function") {
            throw new Error("authenticatorFactory must be a function.");
        }

        this.registeredAuthTypes[authType] = authenticatorFactory;

        return this;
    }

    get(authType: string, authContext?: any): Authenticator {
        authType = Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === (authType || "").toLowerCase());

        return authType && this.registeredAuthTypes[authType] && this.registeredAuthTypes[authType](authContext);
    };
}