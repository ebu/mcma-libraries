import { Authenticator } from "./authenticator";

export interface AuthTypeRegistration {
    authType: string;
    authenticator: Authenticator;
}
