import { Authenticator } from "./authenticator";
import { McmaException } from "@mcma/core";
import { AuthTypeRegistration } from "./auth-type-registration";

export class AuthProvider {
    registeredAuthTypes: { [key: string]: Authenticator } = {};

    add<T>(authTypeRegistration: AuthTypeRegistration): AuthProvider;
    add<T>(authTypeOrRegistration: string | AuthTypeRegistration, authenticator?: Authenticator): AuthProvider {
        let authType: string;
        if (typeof authTypeOrRegistration === "string") {
            if (Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === authTypeOrRegistration.toLowerCase())) {
                throw new McmaException("Auth type '" + authTypeOrRegistration + "' has already been registered.");
            }
            if (typeof authenticator?.sign !== "function") {
                throw new McmaException("authenticator must have a sign function.");
            }
            authType = authTypeOrRegistration;
        } else {
            authType = authTypeOrRegistration.authType;
            authenticator = authTypeOrRegistration.authenticator;
        }

        this.registeredAuthTypes[authType] = authenticator;

        return this;
    }

    get(authType: string): Authenticator {
        authType = Object.keys(this.registeredAuthTypes).find((k: string) => k.toLowerCase() === (authType || "").toLowerCase());
        return authType && this.registeredAuthTypes[authType] && this.registeredAuthTypes[authType];
    }

    getDefault(): Authenticator {
        if (Object.keys(this.registeredAuthTypes).length === 1) {
            return this.registeredAuthTypes[Object.keys(this.registeredAuthTypes)[0]];
        }
        return null;
    }
}
