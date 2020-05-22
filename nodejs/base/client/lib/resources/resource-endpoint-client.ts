import { AxiosResponse } from "axios";
import { McmaException, ResourceEndpointProperties } from "@mcma/core";
import { Http, HttpClient, HttpRequestConfig } from "../http";
import { AuthProvider } from "../auth";

const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

function reviver(this: any, key: string, value: any): any {
    if (typeof value === "string" && dateFormat.test(value)) {
        return new Date(value);
    }

    return value;
}

export class ResourceEndpointClient implements Http {
    private _httpClient: HttpClient;

    constructor(
        private resourceEndpoint: ResourceEndpointProperties,
        private authProvider: AuthProvider,
        private serviceAuthType?: string,
        private serviceAuthContext?: any
    ) {
        if (!resourceEndpoint) {
            throw new McmaException("resourceEndpoint cannot be null or undefined.");
        }

        if (!!authProvider && typeof authProvider.get !== "function") {
            throw new McmaException("ResourceEndpoint: Provided authProvider does not define the required get(authType, authContext) function.", null, resourceEndpoint);
        }
    }

    get httpEndpoint(): string {
        return this.resourceEndpoint.httpEndpoint;
    }

    private get httpClient(): HttpClient {
        if (!this._httpClient) {
            const authenticator =
                this.authProvider &&
                this.authProvider.get(this.resourceEndpoint.authType || this.serviceAuthType, this.resourceEndpoint.authContext || this.serviceAuthContext);

            this._httpClient = new HttpClient(authenticator);
        }
        return this._httpClient;
    }

    private prepareRequest(urlOrConfig: string | HttpRequestConfig, config?: HttpRequestConfig, body?: any) {
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

        config.baseURL = this.resourceEndpoint.httpEndpoint;
        config.transformResponse = (data) => {
            if (data) {
                try {
                    return JSON.parse(data, reviver);
                } catch {
                }
            }
            return data;
        };

        return { url, config, body };
    }

    async get<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        const request = this.prepareRequest(urlOrConfig, config);
        return await this.httpClient.get(request.url, request.config);
    }

    async post<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        const request = this.prepareRequest(urlOrConfig, config, body);
        return await this.httpClient.post(request.body, request.url, request.config);
    }

    async put<T extends any>(body: T, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        const request = this.prepareRequest(urlOrConfig, config, body);
        return await this.httpClient.put(request.body, request.url, request.config);
    }

    async patch<T extends any>(body: Partial<T>, urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        const request = this.prepareRequest(urlOrConfig, config, body);
        return await this.httpClient.patch(request.body, request.url, request.config);
    }

    async delete<T extends any>(urlOrConfig?: string | HttpRequestConfig, config?: HttpRequestConfig): Promise<AxiosResponse<T>> {
        const request = this.prepareRequest(urlOrConfig, config);
        return await this.httpClient.delete(request.url, request.config);
    }
}
