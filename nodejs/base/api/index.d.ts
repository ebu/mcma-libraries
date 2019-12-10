import { ContextVariableProvider, McmaTracker, Resource, ResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

export enum HttpStatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    Processing = 102,
    Checkpoint = 103,
    OK = 200,
    Created = 201,
    Accepted = 202,
    NonAuthoritativeInformation = 203,
    NoConsent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultiStatus = 207,
    AlreadyReported = 208,
    ImUsed = 226,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    TemporaryRedirect = 307,
    PermanentRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    ProxyAuthenticationRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    PayloadTooLarge = 413,
    UriTooLong = 414,
    UnsupportedMediaType = 415,
    RequiredRangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    IAmATeapot = 418,
    UnprocessableEntity = 422,
    Locked = 423,
    FailedDependency = 424,
    TooEarly = 425,
    UpgradeRequired = 426,
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    UnavailableForLegalReasons = 451,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HttpVersionNotSupported = 505,
    VariantAlsoNegotiates = 506,
    InsufficientStorage = 507,
    LoopDetected = 508,
    BandwidthLimitExceeded = 509,
    NotExtended = 510,
    NetworkAuthenticationRequired = 511,
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
    setResponseBody<T extends Resource>(resource: T | T[]): void;

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
