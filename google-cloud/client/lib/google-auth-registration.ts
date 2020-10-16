import { AuthTypeRegistration } from "@mcma/client";
import { GoogleAuthOptions } from "google-auth-library";

import { GoogleAuthenticator } from "./google-authenticator";

export function googleAuth(options?: GoogleAuthOptions): AuthTypeRegistration<GoogleAuthOptions> {
    return {
        authType: "Google",
        authenticatorFactory:
            (authContext: GoogleAuthOptions) =>
                new GoogleAuthenticator(Object.assign({}, options ?? {}, authContext ?? {}))
    };
}
