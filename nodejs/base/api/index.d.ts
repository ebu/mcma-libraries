import { ContextVariableProvider, Resource, ResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NOT_AUTHORITATIVE = 203,
    NO_CONTENT = 204,
    RESET = 205,
    PARTIAL = 206,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTH = 407,
    CLIENT_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECON_FAILED = 412,
    ENTITY_TOO_LARGE = 413,
    REQ_TOO_LONG = 414,
    UNSUPPORTED_TYPE = 415,
    INTERNAL_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    VERSION = 50 
}

export class McmaApiRequestConfig {
    path: string;
    httpMethod: string;
    headers?: { [key: string]: string };
    pathVariables?: { [key: string]: string };
    queryStringParameters?: { [key: string]: string };
    body?: any;

}

export class McmaApiRequest extends McmaApiRequestConfig {
    constructor(config: McmaApiRequestConfig);
}

export class McmaApiResponse {
    statusCode: number;
    statusMessage: string;
    headers: { [key: string]: string };
    body: any;
}

export class McmaApiRequestContext extends ContextVariableProvider {
    constructor(request: McmaApiRequest, contextVariables: { [key: string]: string });

    request: McmaApiRequest;
    response: McmaApiResponse;

    isBadRequestDueToMissingBody<T extends Resource>(): T | undefined;
    resourceCreated<T extends Resource>(resource: T): void;
    resourceIfFound<T extends Resource>(resource: T, setBody?: boolean): boolean;
}

declare module "mcma-core" {
    interface ContextVariableProvider {
        publicUrl(): string;
        workerFunctionName(): string;
    }
}

export type McmaApiRouteHandler = (requestContext: McmaApiRequestContext) => Promise<void>;

export class McmaApiRoute {
    constructor(httpMethod: string, path: string, handler: McmaApiRouteHandler);
}

export class McmaApiRouteCollection {
    constructor(routes?: McmaApiRoute[]);

    [Symbol.iterator](): McmaApiRoute;

    addRoute(route: McmaApiRoute): McmaApiRouteCollection;
    addRoute(method: string, path: string, handler: McmaApiRouteHandler): McmaApiRouteCollection;
    addRoutes(routes: McmaApiRouteCollection): McmaApiRouteCollection;
    addRoutes(routes: McmaApiRoute[]): McmaApiRouteCollection;
}

export type InvokeWorker = (workerFunctionName: string, payload: any) => Promise<void>;

export type DbTableProviderFactory<T extends Resource> = (type: ResourceType<T>) => DbTableProvider<T>;

export interface DefaultRouteBuilder<T> {
    overrideHandler(handler: McmaApiRouteHandler): void;
    onStarted(handleOnStarted: ((requestContext: McmaApiRequestContext) => Promise<void>));
    onCompleted(handleOnCompleted: ((requestContext: McmaApiRequestContext) => Promise<T>));
    build(): McmaApiRoute;
}

export interface DefaultRoutes<T extends Resource> {
    query: DefaultRouteBuilder<T[]>;
    create: DefaultRouteBuilder<T>;
    get: DefaultRouteBuilder<T>;
    update: DefaultRouteBuilder<T>;
    delete: DefaultRouteBuilder<T>;
}

export interface DefaultRouteConfigurator<T> {
    configure(configureRoute: (defaultRouteBuilder: DefaultRouteBuilder<T>) => void): DefaultRouteCollectionBuilder;
    add(): DefaultRouteCollectionBuilder;
    remove(): DefaultRouteCollectionBuilder;
}

export interface DefaultRouteCollectionBuilder {
    addAll(): DefaultRouteCollectionBuilder;
    route<T extends Resource>(selectRoute: (defaultRoutes: DefaultRoutes<T>) => DefaultRouteBuilder<T>): DefaultRouteConfigurator<T>;
    build(): McmaApiRouteCollection;

    forJobAssignments(invokeWorker: InvokeWorker): McmaApiRouteCollection;
}

export interface DefaultRoutesBuilderFactory {
    builder<T extends Resource>(getDbTableProvider: DbTableProviderFactory<T>, root?: string): DefaultRouteCollectionBuilder;
}

export function defaultRoutes<T extends Resource>(type: ResourceType<T>): DefaultRoutesBuilderFactory;

export class McmaApiController {
    constructor(routes: McmaApiRouteCollection);

    handleRequest(requestContext: McmaApiRequestContext): Promise<void>;
}