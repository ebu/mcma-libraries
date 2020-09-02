import { HttpRequestConfig } from "../http/http-request-config";

export interface Authenticator {
    sign(config: HttpRequestConfig): Promise<void>;
}