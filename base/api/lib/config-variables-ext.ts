import { ConfigVariables } from "@mcma/core";

export function getPublicUrl(configVariables: ConfigVariables = ConfigVariables.getInstance()): string {
    return configVariables.get("PublicUrl");
}
