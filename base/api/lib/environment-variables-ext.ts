import { EnvironmentVariables } from "@mcma/core";

export function getPublicUrl(environmentVariables: EnvironmentVariables = EnvironmentVariables.getInstance()): string {
    return environmentVariables.get("PublicUrl");
}
