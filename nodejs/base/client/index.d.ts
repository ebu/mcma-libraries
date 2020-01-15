import { AxiosPromise, AxiosRequestConfig } from "axios";
import { ContextVariableProvider, JobBase, Resource, ResourceEndpoint, ResourceType, Service, McmaTracker } from "@mcma/core";

export type HttpResponsePromise = AxiosPromise;

export interface HttpRequestConfig extends AxiosRequestConfig {
    tracker?: McmaTracker;
}

export interface Authenticator {
    sign(config: HttpRequestConfig): void | Promise<void>;
}

export type AuthenticatorFactory = (authContext?: any) => Authenticator;

export class AuthProvider {
    constructor();

    add(authType: string, authenticatorFactory: AuthenticatorFactory): void;
    get(authType: string, authContext?: any): Authenticator;

    addAccessTokenAuth<T>(tokenProvider: AccessTokenProvider<T>, authType?: string): AuthProvider;
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
    getResourceEndpointClient<T extends Resource>(resourceType: ResourceType<T>): ResourceEndpointClient;
    getAllResourceEndpointClients(): ResourceEndpointClient[];
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

    query<T extends Resource>(resourceType: ResourceType<T>, filter?: any): Promise<T[] | null>;
    create<T extends Resource>(resource: T): Promise<T>;
    get<T extends Resource>(resource: T | string): Promise<T | undefined>;
    update<T extends Resource>(resource: T): Promise<T>;
    delete<T extends Resource>(resource: T | string): Promise<void>;

    getResourceEndpointClient(url: string): Promise<ResourceEndpointClient | undefined>;
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

export namespace McmaHeaders {
    export const prefix: string;
    export const tracker: string;
}

export interface AccessToken {
    accessToken: string;
    expiresOn: Date | number;
}

export interface AccessTokenProvider<T> {
    getAccessToken(authContext: T): Promise<AccessToken>;
}

export class AccessTokenAuthenticator<T> implements Authenticator {
    constructor(tokenProvider: AccessTokenProvider<T>, authContext: T);

    sign(config: HttpRequestConfig): void | Promise<void>;
}