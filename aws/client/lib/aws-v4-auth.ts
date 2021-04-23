import { AuthTypeRegistration } from "@mcma/client";
import { AwsV4Authenticator } from "./aws-v4";
import { AwsAuthContext, conformToAwsV4AuthContext } from "./aws-auth-context";
import { AwsConfig } from "./aws-config";
import { Aws } from "./aws";

export function awsV4Auth(baseAuthContext?: Aws | AwsConfig | AwsAuthContext): AuthTypeRegistration<AwsAuthContext> {
    const baseContextConformed = conformToAwsV4AuthContext(baseAuthContext);
    return {
        authType: "AWS4",
        authenticatorFactory: authContext => {
            const authContextConformed = conformToAwsV4AuthContext(authContext, false);
            return new AwsV4Authenticator(Object.assign({}, baseContextConformed, authContextConformed));
        }
    };
}
