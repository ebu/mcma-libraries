import { Authenticator } from "./authenticator.js";

export interface AuthTypeRegistration {
    authType: string;
    authenticator: Authenticator;
}
