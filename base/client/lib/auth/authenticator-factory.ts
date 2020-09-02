import { Authenticator } from "./authenticator";

export type AuthenticatorFactory<T> = (authContext?: T) => Authenticator;