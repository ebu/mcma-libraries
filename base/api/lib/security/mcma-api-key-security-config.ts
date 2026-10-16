import { HttpMethod } from "../http/index.js";

export interface McmaApiKeySecurityConfig {
    "no-auth"?: { [pathRegExp: string]: [HttpMethod] };
    "valid-auth"?: { [pathRegExp: string]: [HttpMethod] };

    [apikey: string]: { [pathRegExp: string]: [HttpMethod] } | undefined;
}
