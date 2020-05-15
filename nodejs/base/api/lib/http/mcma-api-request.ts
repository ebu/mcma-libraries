import { McmaApiRequestConfig } from "./mcma-api-request-config";

export class McmaApiRequest extends McmaApiRequestConfig {
    constructor(config: McmaApiRequestConfig) {
        super();

        this.id = config?.id ??  null;
        this.path = config?.path ?? null;
        this.httpMethod = config?.httpMethod ?? null;
        this.headers = config?.headers ?? {};
        this.pathVariables = config?.pathVariables ?? {};
        this.queryStringParameters = config?.queryStringParameters ?? {};
        this.body = config?.body ?? null;
    }
}
