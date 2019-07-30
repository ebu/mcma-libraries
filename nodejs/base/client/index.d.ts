import { AxiosRequestConfig, AxiosPromise } from "axios";
import { Resource, ResourceType, Service, ResourceEndpoint, ContextVariableProvider, JobBase } from "@mcma/core";

export type HttpRequestConfig = AxiosRequestConfig;
export type HttpResponsePromise = AxiosPromise;

export interface Authenticator {
    sign(config: HttpRequestConfig): void;
}

export type AuthenticatorFactory = (authContext?: any) => Authenticator;

export class AuthProvider {
    constructor();
    
    add(authType: string, authenticatorFactory: AuthenticatorFactory): void;
    get(authType: string, authContext?: any): Authenticator;
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
    constructor(authenticator?: Authenticator);
    
    authenticator: Authenticator;

    request(config: HttpRequestConfig): HttpResponsePromise;
    get(url: string, config?: HttpRequestConfig): HttpResponsePromise;
    post(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    put(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    patch(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    delete(url: string, config?: HttpRequestConfig): HttpResponsePromise;
}

export class ServiceClient {
    constructor(service: Service, authProvider?: AuthProvider);

    hasResourceEndpoint<T extends Resource>(resourceType: ResourceType<T>): boolean;
    getResourceEndpoint<T extends Resource>(resourceType: ResourceType<T>): ResourceEndpointClient;
    getAllResourceEndpoints(): ResourceEndpointClient[];
}

export class ResourceEndpointClient implements Http {
    constructor(resourceEndpoint: ResourceEndpoint, authProvider?: AuthProvider, serviceAuthType?: string, serviceAuthContext?: any);
    
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
}

export class ResourceManager {
    constructor(config: ResourceManagerConfig, authProvider: AuthProvider);

    init(): Promise<void>;
    get<T extends Resource>(resourceType: ResourceType<T>, filter?: any): Promise<T[] | null>;
    create<T extends Resource>(resource: T): Promise<T>;
    update<T extends Resource>(resource: T): Promise<T>;
    delete<T extends Resource>(resource: T | string): Promise<void>;

    getResourceEndpoint(url: string): Promise<ResourceEndpointClient | undefined>;
    resolve<T extends Resource>(resource: T | string): Promise<T | undefined>;
    sendNotification(resource: JobBase): Promise<void>;
}

declare module "@mcma/core" {
    interface ContextVariableProvider {
        getResourceManagerConfig(): ResourceManagerConfig;
    }
}

export class ResourceManagerProvider {
    constructor(authProvider: AuthProvider, defaultConfig?: ResourceManagerConfig);

    get(config?: ResourceManagerConfig): ResourceManager;
}