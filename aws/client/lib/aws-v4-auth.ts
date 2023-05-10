import { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { AuthTypeRegistration } from "@mcma/client";
import { AwsV4Authenticator } from "./aws-v4";

export function awsV4Auth(config?: { credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>, region?: string, serviceName?: string }): AuthTypeRegistration {
    return {
        authType: "AWS4",
        authenticator: new AwsV4Authenticator(config),
    };
}
