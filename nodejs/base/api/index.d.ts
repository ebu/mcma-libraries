import { ContextVariableProvider, McmaTracker, Resource, ResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

export enum HttpStatusCode {
    CONTINUE = 100,
    SWITCHING_PROTOCOLS = 101,
    PROCESSING = 102,
    CHECKPOINT = 103,
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NON_AUTHORITATIVE_INFORMATION = 203,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,
    MULTI_STATUS = 207,
    ALREADY_REPORTED = 208,
    IM_USED = 226,
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    REQUESTED_RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    I_AM_A_TEAPOT = 418,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    BANDWIDTH_LIMIT_EXCEEDED = 509,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511,
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

    hasRequestBody(): boolean;
    getRequestBody<T extends Resource>(): T;

    setResponseStatusCode(statusCode: number | HttpStatusCode, statusMessage?: string): void;
    setResponseBody<T extends Resource>(resource: T): void;

    setResponseResourceCreated<T extends Resource>(resource: T): void;
    setResponseBadRequestDueToMissingBody(): void;
    setResponseResourceNotFound(): void;

    getTracker(): McmaTracker;
}

declare module "@mcma/core" {
    interface ContextVariableProvider {
        publicUrl(): string;

        workerFunctionId(): string;
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

export interface WorkerRequest {
    operationName: string;
    contextVariables: { [key: string]: string };
    input: any;
}

export type InvokeWorker = (workerFunctionId: string, payload: WorkerRequest) => Promise<void>;

export class WorkerInvoker {
    constructor(invokeWorker: InvokeWorker);

    invoke(workerFunctionId: string, operationName: string, contextVariables: { [key: string]: string }, input: any, tracker?: McmaTracker): Promise<void>;
    invoke(workerFunctionId: string, workerRequest: WorkerRequest): Promise<void>;
}

export type DbTableProviderFactory<T extends Resource> = (type: ResourceType<T>) => DbTableProvider<T>;

export interface DefaultRouteBuilder<T> {
    overrideHandler(handler: McmaApiRouteHandler): void;

    onStarted(handleOnStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>): DefaultRouteBuilder<T>;

    onCompleted(handleOnCompleted: (requestContext: McmaApiRequestContext, resource: Resource) => Promise<T>): DefaultRouteBuilder<T>;

    build(): McmaApiRoute;
}

export interface DefaultRoutes<T extends Resource> {
    query: DefaultRouteBuilder<T[]>;
    create: DefaultRouteBuilder<T>;
    get: DefaultRouteBuilder<T>;
    update: DefaultRouteBuilder<T>;
    delete: DefaultRouteBuilder<T>;
}

export interface DefaultRouteConfigurator<T extends Resource> {
    configure<TConfigure = T | T[]>(configureRoute: (defaultRouteBuilder: DefaultRouteBuilder<TConfigure>) => void): DefaultRouteCollectionBuilder<T>;

    add(): DefaultRouteCollectionBuilder<T>;

    remove(): DefaultRouteCollectionBuilder<T>;
}

export class DefaultRouteCollectionBuilder<T extends Resource> {
    constructor(dbTableProvider: DbTableProvider<T>, resourceType: ResourceType<T>, root?: string);

    addAll(): DefaultRouteCollectionBuilder<T>;
    route(selectRoute: (defaultRoutes: DefaultRoutes<T>) => DefaultRouteBuilder<T> | DefaultRouteBuilder<T[]>): DefaultRouteConfigurator<T>;
    build(): McmaApiRouteCollection;

    forJobAssignments(invokeWorker: InvokeWorker): McmaApiRouteCollection;
}

export class McmaApiController {
    constructor(routes: McmaApiRouteCollection);

    handleRequest(requestContext: McmaApiRequestContext): Promise<void>;
}
