import { SecretsProvider } from "@mcma/secrets";
import { McmaApiKeySecurityConfig } from "./mcma-api-key-security-config";
import { HttpMethod, HttpStatusCode, McmaApiMiddleware, McmaApiRequestContext } from "../http";
import { getApiSecurityConfigSecretId } from "../config-variables-ext";

export interface McmaApiKeySecurityMiddlewareConfig {
    apiSecurityConfigSecretId?: string;
    secretsProvider: SecretsProvider;
}

export class McmaApiKeySecurityMiddleware implements McmaApiMiddleware {
    private apiSecurityConfig: McmaApiKeySecurityConfig;

    constructor(private config: McmaApiKeySecurityMiddlewareConfig) {
    }

    private static configAllowsAccess(config: { [pathRegExp: string]: [HttpMethod] }, path: string, httpMethod: HttpMethod) {
        if (config) {
            for (const regexpString of Object.keys(config)) {
                const regexp = new RegExp(regexpString);
                if (regexp.test(path)) {
                    return config[regexpString].includes(HttpMethod.ANY) || config[regexpString].includes(httpMethod);
                }
            }
        }
        return false;
    }

    async execute(requestContext: McmaApiRequestContext, next: (requestContext: McmaApiRequestContext) => Promise<void>) {
        if (!this.config.apiSecurityConfigSecretId) {
            this.config.apiSecurityConfigSecretId = getApiSecurityConfigSecretId(requestContext.configVariables);
        }
        if (!this.apiSecurityConfig) {
            this.apiSecurityConfig = await this.config.secretsProvider.getAs<McmaApiKeySecurityConfig>(this.config.apiSecurityConfigSecretId);
        }

        const path = requestContext.request.path;
        const httpMethod = requestContext.request.httpMethod as HttpMethod;
        const apiKey = requestContext.request.headers["x-mcma-api-key"];

        if (McmaApiKeySecurityMiddleware.configAllowsAccess(this.apiSecurityConfig["no-auth"], path, httpMethod)) {
            return next(requestContext);
        }

        if (!apiKey || apiKey === "no-auth" || apiKey === "valid-auth" || !this.apiSecurityConfig[apiKey]) {
            requestContext.setResponseError(HttpStatusCode.Unauthorized);
            return;
        }

        if (McmaApiKeySecurityMiddleware.configAllowsAccess(this.apiSecurityConfig["valid-auth"], path, httpMethod)) {
            return next(requestContext);
        }

        if (McmaApiKeySecurityMiddleware.configAllowsAccess(this.apiSecurityConfig[apiKey], path, httpMethod)) {
            return next(requestContext);
        }

        requestContext.setResponseError(HttpStatusCode.Forbidden);
    };
}

