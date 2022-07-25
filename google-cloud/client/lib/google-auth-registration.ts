import { AuthTypeRegistration } from "@mcma/client";
import { GoogleAuthOptions } from "google-auth-library";

import { GoogleAuthenticator } from "./google-authenticator";

export function googleAuth(options?: GoogleAuthOptions): AuthTypeRegistration {
    return {
        authType: "Google",
        authenticator: new GoogleAuthenticator(Object.assign({}, options ?? {}))
    };
}
