import { AuthenticatorFactory } from "./authenticator-factory";

export interface AuthTypeRegistration<T> {
    authType: string;
    authenticatorFactory: AuthenticatorFactory<T>
}