import { HttpMethod } from "../http";

export interface McmaApiKeySecurityConfig {
    "no-auth"?: { [pathRegExp: string]: [HttpMethod] };
    "valid-auth"?: { [pathRegExp: string]: [HttpMethod] };

    [apikey: string]: { [pathRegExp: string]: [HttpMethod] };
}
