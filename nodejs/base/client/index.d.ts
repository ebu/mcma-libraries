import { AxiosRequestConfig, AxiosPromise } from "axios";
import { Resource, ResourceType, Service, ResourceEndpoint, ContextVariableProvider } from "@mcma/core";

export type HttpRequestConfig = AxiosRequestConfig;
export type HttpResponsePromise = AxiosPromise;

export interface Authenticator {
    sign(config: HttpRequestConfig): void;
}

export interface AuthenticatorProvider {
    getAuthenticator(authType: string, authContext: any): Authenticator;
}

export interface Http {
    request(config: HttpRequestConfig): HttpResponsePromise;
    get(url: string, config?: HttpRequestConfig): HttpResponsePromise;
    post(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    put(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    patch(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    delete(url: string, config?: HttpRequestConfig): HttpResponsePromise;
}

export class HttpClient implements Http {
    constructor(authenticator: Authenticator);
    request(config: HttpRequestConfig): HttpResponsePromise;
    get(url: string, config?: HttpRequestConfig): HttpResponsePromise;
    post(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    put(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    patch(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    delete(url: string, config?: HttpRequestConfig): HttpResponsePromise;
}

export class ServiceClient {
    constructor(service: Service, authProvider?: AuthenticatorProvider);

    hasResourceEndpoint(resourceType: string): boolean;
    getResourceEndpoint(resourceType: string): ResourceEndpointClient;
    getAllResourceEndpoints(): ResourceEndpointClient[];
}

export class ResourceEndpointClient implements Http {
    constructor(resourceEndpoint: ResourceEndpoint, authProvider?: AuthenticatorProvider, serviceAuthType?: string, serviceAuthContext?: any);
    
    httpEndpoint: string;
    
    request(config: HttpRequestConfig): HttpResponsePromise;
    get(url: string, config?: HttpRequestConfig): HttpResponsePromise;
    post(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    put(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    patch(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    delete(url: string, config?: HttpRequestConfig): HttpResponsePromise;
}

export interface ResourceManagerConfig {
    servicesUrl: string;
    servicesAuthType?: string;
    servicesAuthContext?: any;
    authProvider?: AuthenticatorProvider;
}

export class ResourceManager {
    constructor(config: ResourceManagerConfig);

    init(): Promise<void>;
    get<T extends Resource>(resourceType: ResourceType<T>, filter?: any): Promise<T[] | null>;
    create<T extends Resource>(resource: T): Promise<T>;
    update<T extends Resource>(resource: T): Promise<T>;
    delete<T extends Resource>(resource: T | string): Promise<void>;

    getResourceEndpoint(url: string): Promise<ResourceEndpointClient | undefined>;
    resolve<T extends Resource>(resource: T | string): Promise<T | undefined>;
}

export type ResourceManagerProvider = (contextVariableProvider: ContextVariableProvider) => ResourceManager;

declare module "@mcma/core" {
    interface ContextVariableProvider {
        getResourceManagerFromContext(authProvider: AuthenticatorProvider): ResourceManager;
    }
}