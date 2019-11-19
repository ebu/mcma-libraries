export type TypeOfValue = "boolean"|"number"|"bigint"|"string"|"symbol"|"function"|"object"|"undefined";
export type PropertyType = "resource"|"url"|"Array"|TypeOfValue;

export abstract class McmaObject {
    protected constructor(type: string, properties: object);

    ["@type"]: string;
    
    checkProperty(propertyName: string, expectedType: PropertyType, required?: boolean): void;
}

export class McmaTracker extends McmaObject {
    constructor(properties: object)

    id: string;
    label: string;
}

export abstract class Resource extends McmaObject {
    protected constructor(type: string, properties: object);

    id: string;
    dateCreated?: string;
    dateModified?: string;

    onCreate(id: string): void;
    onUpsert(id: string): void;
}

export interface ResourceConstructor<T extends Resource> {
    new(...args): T;

    name: string;
}

export type ResourceType<T extends Resource> = string | ResourceConstructor<T>;

export const onResourceCreate: (resource: Resource, id: string) => void;
export const onResourceUpsert: (resource: Resource, id: string) => void;

export interface ServiceProperties {
    name: string;
    resources: (ResourceEndpointProperties | string)[];
    authType?: string;
    jobType?: string;
    jobProfiles?: (JobProfileProperties | string)[];
}

export class Service extends Resource implements ServiceProperties {
    constructor(properties: ServiceProperties);

    name: string;
    resources: (ResourceEndpointProperties | string)[];
    authType?: string;
    jobType?: string;
    jobProfiles?: (JobProfileProperties | string)[];
}

export interface ResourceEndpointProperties {
    resourceType: string;
    httpEndpoint: string;
    authType?: string;
    authContext?: string;
}

export class ResourceEndpoint extends McmaObject implements ResourceEndpointProperties {
    constructor(properties: ResourceEndpointProperties);

    resourceType: string;
    httpEndpoint: string;
    authType?: string;
    authContext?: string;
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

export class JobParameterBag extends McmaObject {
    constructor(properties: object);

    [key: string]: any;
}

export class Locator extends Resource {
    constructor();
    constructor(type: string);
    constructor(properties: object);
    constructor(type: string, properties: object);

    [key: string]: any;
}

export interface NotificationProperties {
    source?: string;
    content: Resource | string;
}

export class Notification extends Resource implements NotificationProperties {
    constructor(properties: NotificationProperties);
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
    tracker?: McmaTracker;
    notificationEndpoint?: NotificationEndpointProperties;
    status?: string;
    statusMessage?: string;
    jobOutput?: JobParameterBag;
}

export abstract class JobBase extends Resource implements JobBaseProperties {
    protected constructor(type: string, properties: JobBaseProperties);

    tracker?: McmaTracker;
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
    constructor(properties: object);

    [key: string]: any;
}

export class BMEssence extends Resource {
    constructor(properties: object);

    [key: string]: any;
}

export class DescriptiveMetadata extends Resource {
    constructor(properties: object);

    [key: string]: any;
}

export class TechnicalMetadata extends Resource {
    constructor(properties: object);

    [key: string]: any;
}

export class Exception extends Error {
    constructor(message: string, cause: string, context: any);
}

export enum JobStatus {
    NEW = "NEW",
    QUEUED = "QUEUED",
    SCHEDULED = "SCHEDULED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
}

export interface ILogger {
    log(level: number, type: string, msg: any, ...args: any[]);

    fatal(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    info(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;

    functionStart(msg: any, ...args: any[]): void;
    functionEnd(msg: any, ...args: any[]): void;
    jobStart(msg: any, ...args: any[]): void;
    jobEnd(msg: any, ...args: any[]): void;
}

export abstract class Logger implements ILogger {
    protected constructor(source: string, tracker: McmaTracker);

    abstract log(level: number, type: string, msg: any, ...args: any[]);
    fatal(msg: any, ...args: any[]): void;
    error(msg: any, ...args: any[]): void;
    warn(msg: any, ...args: any[]): void;
    info(msg: any, ...args: any[]): void;
    debug(msg: any, ...args: any[]): void;

    functionStart(msg: any, ...args: any[]): void;
    functionEnd(msg: any, ...args: any[]): void;
    jobStart(msg: any, ...args: any[]): void;
    jobEnd(msg: any, ...args: any[]): void;
}

export interface LoggerProvider {
    get(tracker?: McmaTracker): ILogger
}

export class ConsoleLoggerProvider implements LoggerProvider {
    constructor(source: string);

    get(tracker?: McmaTracker): ILogger;
}

export abstract class ContextVariableProvider {
    protected constructor(contextVariables: { [key: string]: string });

    getAllContextVariables(): { [key: string]: string };
    getRequiredContextVariable(key: string): string;
    getOptionalContextVariable(key: string, defaultValue?: string): string | undefined;

    tableName(): string;
}

export class EnvironmentVariableProvider extends ContextVariableProvider {
    constructor();
}

export namespace Utils {
    function getTypeName(type: { name: string } | { ["@type"]: string } | string): string;
    function toBase64(text: string): string;
    function fromBase64(base64Text: string): string;
}

export as namespace McmaCore;
