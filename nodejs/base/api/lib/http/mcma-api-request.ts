import { McmaApiRequestConfig } from "./mcma-api-request-config";
export class McmaApiRequest extends McmaApiRequestConfig {
    constructor(config: McmaApiRequestConfig) {
        super();
        this.path = (config && config.path) || null;
        this.httpMethod = (config && config.httpMethod) || null;
        this.headers = (config && config.headers) || {};
        this.pathVariables = (config && config.pathVariables) || {};
        this.queryStringParameters = (config && config.queryStringParameters) || {};
        this.body = (config && config.body) || null;
    }
}
