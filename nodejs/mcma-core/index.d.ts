import { AxiosRequestConfig, AxiosPromise } from "axios";

export type HttpRequestConfig = AxiosRequestConfig;
export type HttpResponsePromise = AxiosPromise;

export interface Authenticator {
    sign(config: HttpRequestConfig): void;
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

export interface AuthenticatorProvider {
    getAuthenticator(authType: string, authContext: any);
}

export interface ResourceConstructor {
    new(): { id: string, ["@type"]: string; };
    name: string;
}

export type ResourceType = string | ResourceConstructor;

export const onResourceCreate: (resource: Resource, id: string) => void;
export const onResourceUpsert: (resource: Resource, id: string) => void;

export abstract class Resource {
    constructor(type: string, properties: any);

    id: string;
    ["@type"]: string;

    onCreate(id: string): void;
    onUpsert(id: string): void;
}

export interface ServiceProperties {
    name: string;
    resources: (ResourceEndpointProperties | string)[];
    authType?: string;
    jobType?: string;
    jobProfiles?: (JobProfileProperties | string)[];
}

export class Service extends Resource implements ServiceProperties {
    constructor(properties: ServiceProperties, authProvider?: AuthenticatorProvider);

    name: string;
    resources: (ResourceEndpointProperties | string)[];
    authType?: string;
    jobType?: string;
    jobProfiles?: (JobProfileProperties | string)[];

    hasResourceEndpoint(resourceType: string);
    getResourceEndpoint(resourceType: string);
}

export interface ResourceEndpointProperties {
    resourceType: string;
    httpEndpoint: string;
    authType?: string;
}

export class ResourceEndpoint extends Resource implements Http, ResourceEndpointProperties {
    constructor(properties: ResourceEndpointProperties, authProvider?: AuthenticatorProvider, serviceAuthType?: string, serviceAuthContext?: any);
    
    resourceType: string;
    httpEndpoint: string;
    authType?: string;

    request(config: HttpRequestConfig): HttpResponsePromise;
    get(url: string, config?: HttpRequestConfig): HttpResponsePromise;
    post(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    put(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    patch(url: string, data?: any, config?: HttpRequestConfig): HttpResponsePromise;
    delete(url: string, config?: HttpRequestConfig): HttpResponsePromise;
}

export interface JobProfileProperties {
    name: string;
    inputParameters?: JobParameterProperties[];
    outputParameters?: JobParameterProperties[];
    optionalInputParameters?: JobParameterProperties[];
}

export class JobProfile extends Resource implements JobProfileProperties {
    constructor(properties: JobProfileProperties);
    name: string;
    inputParameters?: JobParameterProperties[];
    outputParameters?: JobParameterProperties[];
    optionalInputParameters?: JobParameterProperties[];
}

export interface JobParameterProperties {
    parameterName: string;
    parameterType?: string;
}

export class JobParameter extends Resource implements JobParameterProperties {
    constructor(properties: JobParameterProperties);
    parameterName: string;
    parameterType?: string;
}

export class JobParameterBag extends Resource {
    constructor(properties: any);
}

export class Locator extends Resource {
    constructor(properties: any);
}

export interface NotificationProperties {
    source?: string;
    content: Resource | string;
}

export interface NotificationEndpointProperties {
    httpEndpoint: string;
}

export class NotificationEndpoint extends Resource implements NotificationEndpointProperties {
    constructor(properties: NotificationEndpointProperties);
    httpEndpoint: string;
}

export interface JobBaseProperties {
    notificationEndpoint?: NotificationEndpointProperties;
    status?: string;
    statusMessage?: string;
    jobOutput?: JobParameterBag;
}

export abstract class JobBase extends Resource implements JobBaseProperties {
    constructor(properties: JobBaseProperties);
    notificationEndpoint?: NotificationEndpointProperties;
    status?: string;
    statusMessage?: string;
    jobOutput?: JobParameterBag;
}

export interface JobProcessProperties extends JobBaseProperties {
    job: JobProperties | string;
}

export class JobProcess extends JobBase implements JobProcessProperties {
    constructor(properties: JobProcessProperties);
    job: JobProperties | string;
}

export interface JobAssignmentProperties extends JobBaseProperties {
    job: JobProperties | string;
}

export class JobAssignment extends JobBase implements JobAssignmentProperties {
    constructor(properties: JobAssignmentProperties);
    job: JobProperties | string;
}

export interface JobProperties extends JobBaseProperties {
    jobProfile: JobProfileProperties | string;
    jobInput: JobParameterBag;
}

export class Job extends JobBase implements JobProperties {
    constructor(type: string, properties: JobProperties);
    jobProfile: JobProfileProperties | string;
    jobInput: JobParameterBag;
}

export class AIJob extends Job {
    constructor(properties: JobProperties);
}

export class AmeJob extends Job {
    constructor(properties: JobProperties);
}

export class CaptureJob extends Job {
    constructor(properties: JobProperties);
}

export class QAJob extends Job {
    constructor(properties: JobProperties);
}

export class TransferJob extends Job {
    constructor(properties: JobProperties);
}

export class TransformJob extends Job {
    constructor(properties: JobProperties);
}

export class WorkflowJob extends Job {
    constructor(properties: JobProperties);
}

export class BMContent extends Resource {
    constructor(properties: any);
}

export class BMEssence extends Resource {
    constructor(properties: any);
}

export class DescriptiveMetadata extends Resource {
    constructor(properties: any);
}

export class TechnicalMetadata extends Resource {
    constructor(properties: any);
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
    get<T extends Resource>(resourceType: ResourceType, filter: any): Promise<T | T[] | null>;
    create<T extends Resource>(resource: T): Promise<T>;
    update<T extends Resource>(resource: T): Promise<T>;
    delete<T extends Resource>(resource: T | string): Promise<void>;

    getResourceEndpoint(url: string): Promise<ResourceEndpoint | undefined>;
    resolve<T extends Resource>(resource: T): Promise<T | undefined>;
}

export class Exception extends Error {
    constructor(message: string, cause: string, context: any);
}

export class JobStatus {
    constructor(name: string);

    static queued: JobStatus;
    static scheduled: JobStatus;
    static running: JobStatus;
    static completed: JobStatus;
    static failed: JobStatus;
}

export interface ILogger {
    debug(msg: string, ...args: any[]): void;
    info(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    exception(error: Error): void;
}

export class Logger {
    static global: ILogger;
    
    static debug(msg: string, ...args: any[]): void;
    static info(msg: string, ...args: any[]): void;
    static warn(msg: string, ...args: any[]): void;
    static error(msg: string, ...args: any[]): void;
    static exception(error: Error): void;
}

export abstract class ContextVariableProvider {
    constructor(contextVariables: { [key: string]: string });

    getAllContextVariables(): { [key: string]: string };
    getRequiredContextVariable(key: string): string;
    getOptionalContextVariable(key: string, defaultValue?: string): string | undefined;

    tableName(): string;
    getResourceManagerFromContext(authProvider: AuthenticatorProvider): ResourceManager;
}

export class EnvironmentVariableProvider extends ContextVariableProvider {
    constructor();
}

export namespace Utils {
    function getTypeName(type: ResourceType): string;
}

export as namespace McmaCore;