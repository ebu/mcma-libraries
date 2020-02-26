import { Authenticator } from "./authenticator";

export type AuthenticatorFactory = (authContext?: any) => Authenticator;