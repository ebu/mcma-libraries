import { McmaException, Utils } from "@mcma/core";
import axios, { AxiosResponse } from "axios";

import { Authenticator } from "../auth";
import { McmaHeaders } from "./headers";
import { Http } from "./http";
import { HttpRequestConfig } from "./http-request-config";

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function reviver(this: any, key: string, value: any): any {
    if (typeof value === "string" && dateFormat.test(value)) {
        return new Date(value);
    }

    return value;
}

export class HttpClient implements Http {
    constructor(private authenticator?: Authenticator) {
        if (authenticator) {
            if (typeof authenticator.sign !== "function") {
                throw new McmaException("HttpClient: Provided authenticator does not define the required sign() function.");
            }
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

    private prepareRequest(method: string, urlOrConfig: string | HttpRequestConfig, config?: HttpRequestConfig, body?: any) {
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
                    return JSON.parse(data, reviver);
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

        if (this.authenticator) {
            await this.authenticator.sign(config);
        }

        // add tracker header, if a tracker is present
        if (config.tracker) {
            config.headers[McmaHeaders.tracker] = Utils.toBase64(JSON.stringify(config.tracker));
            delete config.tracker;
        }

        // send request using axios
        try {
            return await axios(config);
        } catch (error) {
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
    };
}
