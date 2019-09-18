import { ContextVariableProvider, Job, JobAssignment, JobParameterBag, JobProfile, JobStatus, ResourceType } from "@mcma/core";
import { ResourceManager, ResourceManagerProvider } from "@mcma/client";
import { DbTable, DbTableProvider } from "@mcma/data";

export class WorkerRequest extends ContextVariableProvider {
    constructor(request: { operationName: string, contextVariables?: { [key: string]: string }, input?: any });

    operationName: string;
    input: any;
}

export interface OperationHandler {
    (workerRequest: WorkerRequest): Promise<void>;
}

export class OperationFilter {
    filter(request: WorkerRequest): boolean;
}

export interface WorkerOperation {
    handler: OperationHandler;
    filter?: OperationFilter;
}

export interface OperationBuilder {
    handle(handler: OperationHandler, filter?: OperationFilter): OperationBuilder;
}

export type OperationConfigurator = (operationHandlerBuilder: OperationBuilder) => void;

export interface NamedOperationHandler extends OperationHandler {
    name: string;
}

export interface ProfileHandler {
    (request: WorkerRequest): Promise<void>;
}

export interface NamedProfileHandler extends ProfileHandler {
    name: string;
}

export interface Profile {
    execute: ProfileHandler;
}

export interface NamedProfile extends Profile {
    name: string;
}

export interface JobHandlerBuilder {
    addProfile(profileName: string, profileHandler: ProfileHandler): JobHandlerBuilder;

    addProfile(profileName: string, profile: Profile): JobHandlerBuilder;

    addProfile(profile: NamedProfileHandler): JobHandlerBuilder;

    addProfile(profile: NamedProfile): JobHandlerBuilder;
}

export class WorkerJobHelper<T extends Job> {
    constructor(jobType: ResourceType<T>, dbTable: DbTable<T>, resourceManager: ResourceManager, request: WorkerRequest, jobAssignmentId: string);

    getTable(): DbTable<T>;
    getResourceManager(): ResourceManager;
    getRequest(): WorkerRequest;
    getJobAssignmentId(): string;
    getJobAssignment(): JobAssignment;
    getJob(): T;
    getProfile(): JobProfile;
    getMatchedProfileName(): string;
    getJobInput(): JobParameterBag;
    getJobOutput(): JobParameterBag;

    initialize(): Promise<void>;
    validateJob(supportedProfiles: string[]): void;
    complete(): Promise<JobAssignment>;
    fail(error: Error | string | any): Promise<JobAssignment>;
    updateJobAssignmentOuput(): Promise<JobAssignment>;
    updateJobAssignmentStatus(status: JobStatus | string, statusMessage?: string): Promise<JobAssignment>;
    updateJobAssignment(update: (jobAssignment: JobAssignment) => void, sendNotification?: boolean): Promise<JobAssignment>;
    sendNotification(): Promise<void>;
}

export class WorkerBuilder {
    handleOperation(operationName: string, configureOperation: OperationConfigurator): WorkerBuilder;
    handleOperation(operationHandler: NamedOperationHandler): WorkerBuilder;
    build(): Worker;

    handleJobsOfType<T extends Job>(
        jobType: ResourceType<T>,
        dbTableProvider: DbTableProvider<JobAssignment>,
        resourceManagerProvider: ResourceManagerProvider,
        configure: (jobHandlerBuilder: JobHandlerBuilder) => void): WorkerBuilder;
}

export class Worker {
    doWork(request: WorkerRequest): Promise<void>;
}
