import { McmaException, Utils } from "@mcma/core";
import { default as axios, AxiosResponse, Method, AxiosRequestConfig, AxiosInstance } from "axios";

import { Authenticator } from "../auth";
import { McmaHeaders } from "./headers";
import { Http } from "./http";
import { HttpRequestConfig } from "./http-request-config";

export type HttpClientConfig = {
    maxAttempts?: number,
    retryInterval?: number,
    axiosConfig?: AxiosRequestConfig
}

export class HttpClient implements Http {
    private client: AxiosInstance;

    constructor(private authenticator?: Authenticator, private readonly config?: HttpClientConfig) {
        if (authenticator) {
            if (typeof authenticator.sign !== "function") {
                throw new McmaException("HttpClient: Provided authenticator does not define the required sign() function.");
            }
        }

        this.config = Object.assign({}, config);

        if (isNaN(this.config.maxAttempts) || this.config.maxAttempts < 1) {
            this.config.maxAttempts = 3;
        }
        if (isNaN(this.config.retryInterval) || this.config.retryInterval < 0) {
            this.config.retryInterval = 5000;
        }

        this.client = axios.create(Object.assign({}, this.config.axiosConfig));
    }

    async get<TResp = any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        return await this.request<TResp>(this.prepareRequest("GET", urlOrConfig, config));
    };

    async post<TResp = any, TReq = any>(body: TReq, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        return await this.request<TResp>(this.prepareRequest("POST", urlOrConfig, config, body));
    };

    async put<TResp = any, TReq = any>(body: TReq, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        return await this.request<TResp>(this.prepareRequest("PUT", urlOrConfig, config, body));
    };

    async patch<TResp = any, TReq = any>(body: Partial<TReq>, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        return await this.request<TResp>(this.prepareRequest("PATCH", urlOrConfig, config, body));
    };

    async delete<TResp = any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        return await this.request<TResp>(this.prepareRequest("DELETE", urlOrConfig, config));
    };

    private prepareRequest(method: Method, urlOrConfig: string | HttpRequestConfig, config?: HttpRequestConfig, body?: any) {
        let url: string;
        if (typeof urlOrConfig === "string") {
            url = urlOrConfig;
        } else if (!config) {
            config = urlOrConfig;
            url = "";
        }

        if (!url && body?.id) {
            url = body.id;
        }

        url = url || "";

        config = config || {};
        config.method = method;
        config.url = url;
        config.data = body;
        config.transformResponse = (data) => {
            if (data) {
                try {
                    return JSON.parse(data, Utils.reviver);
                } catch {
                }
            }
            return data;
        };

        return config;
    }

    private async request<TResp = any>(config: HttpRequestConfig): Promise<AxiosResponse<TResp>> {
        if (!config) {
            throw new McmaException("HttpClient: Missing configuration for making HTTP request");
        }

        if (config.method === undefined) {
            config.method = "GET";
        }

        if (config.baseURL) {
            if (!config.url) {
                config.url = config.baseURL;
            } else if (config.url.indexOf("http://") !== 0 && config.url.indexOf("https://") !== 0) {
                config.url = config.baseURL + config.url;
            } else if (!config.url.startsWith(config.baseURL)) {
                throw new McmaException("HttpClient: Making " + config.method + " request to URL '" + config.url + "' which does not match baseURL '" + config.baseURL + "'");
            }
        }

        if (!config.url) {
            throw new McmaException("HttpClient: Missing url in request config");
        }

        // add tracker header, if a tracker is present
        if (config.tracker) {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers[McmaHeaders.tracker] = Utils.toBase64(JSON.stringify(config.tracker));
            delete config.tracker;
        }

        // try copying original headers so we can safely run the authentication signer multiple times
        let headers = config.headers;
        if (headers) {
            try {
                headers = JSON.parse(JSON.stringify(headers));
            } catch (error) {
                console.error("HttpClient: Failed to copy headers due to:");
                console.error(error);
            }
        }

        // send request using axios
        for (let attempts = 0; attempts < this.config.maxAttempts; attempts++) {
            try {
                config.headers = headers;

                if (this.authenticator) {
                    await this.authenticator.sign(config);
                }

                return await this.client.request(config) as AxiosResponse<TResp>;
            } catch (error) {
                if (attempts < this.config.maxAttempts - 1) {
                    await Utils.sleep(this.config.retryInterval);
                } else {
                    let response;
                    if (error?.response?.data) {
                        response = error.response.data;
                    } else if (error?.response) {
                        response = error.response;
                    } else {
                        response = "none";
                    }

                    throw new McmaException("HttpClient: " + config.method + " request to " + config.url + " failed!", error, {
                        config,
                        response
                    });
                }
            }
        }

        // Though it never arrives here compiler complains about "TS7030: Not all code paths return a value."
        throw new McmaException("HttpClient: " + config.method + " request to " + config.url + " failed!");
    };
}
