import { HttpRequestConfig } from "../http/http-request-config.js";

export interface Authenticator {
    sign(config: HttpRequestConfig): Promise<void>;
}