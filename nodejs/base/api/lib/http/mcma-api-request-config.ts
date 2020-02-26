export class McmaApiRequestConfig {
    path: string;
    httpMethod: string;
    headers?: {
        [key: string]: string;
    };
    pathVariables?: {
        [key: string]: string;
    };
    queryStringParameters?: {
        [key: string]: string;
    };
    body?: any;
}
