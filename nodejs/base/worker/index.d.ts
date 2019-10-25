import { ContextVariableProvider, EnvironmentVariableProvider, ILogger, LoggerProvider, Job, JobAssignment, JobParameterBag, JobProfile, JobStatus, McmaTracker, ResourceType } from "@mcma/core";
import { AuthProvider, ResourceManager, ResourceManagerProvider } from "@mcma/client";
import { DbTable, DbTableProvider } from "@mcma/data";

export class ProviderCollection {
    constructor(dbTableProvider, environmentVariableProvider, loggerProvider, resourceManagerProvider);

    authProvider: AuthProvider;
    dbTableProvider: DbTableProvider<JobAssignment>;
    environmentVariableProvider: EnvironmentVariableProvider;
    loggerProvider: LoggerProvider;
    resourceManagerProvider: ResourceManagerProvider;

    getAuthProvider(): AuthProvider;
    getDbTableProvider(): DbTableProvider<JobAssignment>;
    getEnvironmentVariableProvider(): EnvironmentVariableProvider;
    getLoggerProvider(): LoggerProvider;
    getResourceManagerProvider(); ResourceManagerProvider;
}

export class WorkerRequest extends ContextVariableProvider {
    constructor(request: { operationName: string, contextVariables?: { [key: string]: string }, input?: any, tracker: McmaTracker });

    operationName: string;
    input: any;
    tracker: McmaTracker;
}

export type OperationFilter = (providers: ProviderCollection, request: WorkerRequest, ctx?: any) => Promise<boolean>;
export type OperationHandler = (providers: ProviderCollection, request: WorkerRequest, ctx?: any) => Promise<void>;

export interface WorkerOperation {
    accepts: OperationFilter;
    execute: OperationHandler;
}

export class Worker {
    constructor(providerCollection: ProviderCollection);

    addOperation(operationName: string, handler: OperationHandler): Worker;
    addOperation(operationFilter: OperationFilter, handler: OperationHandler): Worker;
    addOperation(operation: WorkerOperation): Worker;

    doWork(request: WorkerRequest, ctx?: any): Promise<void>;
}

export class ProcessJobAssignmentHelper<T extends Job> {
    constructor(dbTable: DbTable<JobAssignment>, resourceManager: ResourceManager, logger: ILogger, request: WorkerRequest);

    getResourceManager(): ResourceManager;
    getTable(): DbTable<JobAssignment>;
    getLogger(): ILogger;
    getRequest(): WorkerRequest;

    getJobAssignmentId(): string;
    getJobAssignment(): JobAssignment;
    getJob(): T;
    getProfile(): JobProfile;
    getJobInput(): JobParameterBag;
    getJobOutput(): JobParameterBag;

    initialize(): Promise<void>;
    validateJob(supportedProfiles: string[]): void;
    complete(): Promise<JobAssignment>;
    fail(error: Error | string | any): Promise<JobAssignment>;
    cancel(message: string | any): Promise<JobAssignment>;
    updateJobAssignmentOutput(): Promise<JobAssignment>;
    updateJobAssignmentStatus(status: JobStatus, statusMessage?: string): Promise<JobAssignment>;
    updateJobAssignment(update: (jobAssignment: JobAssignment) => void, sendNotification?: boolean): Promise<JobAssignment>;
    sendNotification(): Promise<void>;
}

export type ProcessJobProfileHandler<T extends Job> = (providers: ProviderCollection, processJobHelper: ProcessJobAssignmentHelper<T>, ctx?: any) => Promise<void>

export interface ProcessJobProfile<T extends Job> {
    name: string;
    execute: ProcessJobProfileHandler<T>;
}

export class ProcessJobAssignmentOperation<T extends Job> implements WorkerOperation {
    constructor(jobType: ResourceType<T>)

    addProfile(profileName: string, handler: ProcessJobProfileHandler<T>): ProcessJobAssignmentOperation<T>
    addProfile(profile: ProcessJobProfile<T>): ProcessJobAssignmentOperation<T>

    accepts: OperationFilter;
    execute: OperationHandler;
}
