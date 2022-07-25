import { AuthTypeRegistration } from "@mcma/client";
import { AwsV4Authenticator } from "./aws-v4";
import { AwsAuthContext, conformToAwsV4AuthContext } from "./aws-auth-context";
import { AwsConfig } from "./aws-config";
import { Aws } from "./aws";

export function awsV4Auth(authContext?: Aws | AwsConfig | AwsAuthContext): AuthTypeRegistration {
    const authContextConformed = conformToAwsV4AuthContext(authContext);
    return {
        authType: "AWS4",
        authenticator: new AwsV4Authenticator(Object.assign({}, authContextConformed)),
    };
}
