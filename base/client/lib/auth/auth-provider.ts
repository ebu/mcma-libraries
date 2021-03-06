import { AuthenticatorFactory } from "./authenticator-factory";
import { Authenticator } from "./authenticator";
import { McmaException } from "@mcma/core";
import { AuthTypeRegistration } from "./auth-type-registration";

export class AuthProvider {
    registeredAuthTypes: { [key: string]: AuthenticatorFactory<unknown> } = {};

    add<T>(authTypeRegistration: AuthTypeRegistration<T>): AuthProvider;
    add<T>(authTypeOrRegistration: string | AuthTypeRegistration<T>, authenticatorFactory?: AuthenticatorFactory<T>): AuthProvider {
        let authType: string;
        if (typeof authTypeOrRegistration === "string") {
            if (Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === authTypeOrRegistration)) {
                throw new McmaException("Auth type '" + authTypeOrRegistration + "' has already been registered.");
            }
            if (typeof authenticatorFactory !== "function") {
                throw new McmaException("authenticatorFactory must be a function.");
            }
            authType = authTypeOrRegistration;
        } else {
            authType = authTypeOrRegistration.authType;
            authenticatorFactory = authTypeOrRegistration.authenticatorFactory;
        }

        this.registeredAuthTypes[authType] = authenticatorFactory;

        return this;
    }

    get<T>(authType: string, authContext?: T | string): Authenticator {
        authType = Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === (authType || "").toLowerCase());

        if (typeof authContext === "string") {
            authContext = JSON.parse(authContext) as T;
        }

        return authType && this.registeredAuthTypes[authType] && this.registeredAuthTypes[authType](authContext);
    }
}
