import { AuthTypeRegistration } from "@mcma/client";
import { AwsV4Authenticator, AwsV4Config } from "./aws-v4";

export function awsV4Auth(config?: AwsV4Config): AuthTypeRegistration {
    return {
        authType: "AWS4",
        authenticator: new AwsV4Authenticator(config),
    };
}
