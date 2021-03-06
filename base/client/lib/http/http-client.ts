import { McmaException, Utils } from "@mcma/core";
import axios, { AxiosResponse, Method } from "axios";

import { Authenticator } from "../auth";
import { McmaHeaders } from "./headers";
import { Http } from "./http";
import { HttpRequestConfig } from "./http-request-config";

export type HttpClientConfig = {
    maxAttempts?: number,
    retryInterval?: number,
}

export class HttpClient implements Http {
    constructor(private authenticator?: Authenticator, private config?: HttpClientConfig) {
        if (authenticator) {
            if (typeof authenticator.sign !== "function") {
                throw new McmaException("HttpClient: Provided authenticator does not define the required sign() function.");
            }
        }
        if (!this.config) {
            this.config = {}
        }
        if (isNaN(this.config.maxAttempts) || this.config.maxAttempts < 1) {
            this.config.maxAttempts = 3;
        }
        if (isNaN(this.config.retryInterval) || this.config.retryInterval < 0) {
            this.config.retryInterval = 5000;
        }
    }

    async get<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        return await this.request<T>(this.prepareRequest("GET", urlOrConfig, config));
    };

    async post<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        return await this.request<T>(this.prepareRequest("POST", urlOrConfig, config, body));
    };

    async put<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        return await this.request<T>(this.prepareRequest("PUT", urlOrConfig, config, body));
    };

    async patch<T extends any>(body: Partial<T>, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        return await this.request<T>(this.prepareRequest("PATCH", urlOrConfig, config, body));
    };

    async delete<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        return await this.request<T>(this.prepareRequest("DELETE", urlOrConfig, config));
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

    private async request<T extends any>(config: HttpRequestConfig): Promise<AxiosResponse<T>> {
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
                console.log("HttpClient: Failed to copy headers due to:");
                console.log(error);
            }
        }

        // send request using axios
        for (let attempts = 0; attempts < this.config.maxAttempts; attempts++) {
            try {
                config.headers = headers;

                if (this.authenticator) {
                    await this.authenticator.sign(config);
                }

                return await axios(config);
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
