//import { Lambda } from "aws-sdk";
import { Authenticator, AuthenticatorProvider, HttpRequestConfig, Resource, ContextVariableProvider, ResourceManager, ResourceType, ResourceManagerProvider } from "mcma-core";
import { DbTable, DbTableProvider } from "mcma-data";
import { McmaApiRouteCollection, DefaultRouteBuilder, DefaultRoutesBuilderFactory, DefaultRouteCollectionBuilder, InvokeWorker } from "mcma-api";
import { WorkerBuilder, JobHandlerBuilder } from "mcma-worker";

interface AwsBaseAuthContext {
    region: string;
    sessionToken?: string;
    serviceName?: string;
}

interface AwsAuthContext1 {
    accessKeyId: string
    secretAccessKey: string
}

interface AwsAuthContext2 {
    accessKey: string;
    secretKey: string;
}

type AwsAuthContext = AwsAuthContext1 | AwsAuthContext2;

export class AwsV4Authenticator implements Authenticator {
    constructor(config: AwsAuthContext);

    sign(request: HttpRequestConfig): void;
}

export class AwsV4PresignedUrlGenerator {
    constructor(config: AwsAuthContext);

    generatePresignedUrl(method: string, requestUrl: string, expires?: number): string;
}

export class DynamoDbTable<T extends Resource> extends DbTable<T> {
    constructor(type: string, tableName: string);
}

export class DynamoDbTableProvider<T extends Resource> {
    table: DbTableProvider<T>;
}

export class ApiGatewayApiController {
    constructor(routes: McmaApiRouteCollection);

    handleRequest(event: any, context: any): Promise<{ statusCode: number, headers: { [key: string]: string }, body: any }>;
}

export interface AwsDefaultRouteBuilder extends DefaultRoutesBuilderFactory {
    withDynamoDb(root: string): DefaultRouteCollectionBuilder;
}

export function awsDefaultRoutes<T extends Resource>(type: ResourceType<T>): AwsDefaultRouteBuilder;

declare module "mcma-api" {
    interface McmaApiRouteCollection {
        toApiGatewayApiController(): ApiGatewayApiController;
    }
}

export function getAwsV4DefaultAuthContext(): AwsAuthContext;
export function getAwsV4DefaultAuthenticator(): Authenticator;
export function getAwsV4DefaultAuthProvider(): AuthenticatorProvider;

export const getAwsV4ResourceManager: ResourceManagerProvider;

export const invokeLambdaWorker: InvokeWorker;

export interface AwsDefaultJobWorkerBuilder {
    handleJobsOfType<T extends Resource>(
        jobType: ResourceType<T>,
        configure: (jobHandlerBuilder: JobHandlerBuilder) => void): WorkerBuilder;
}

declare module "mcma-worker" {
    interface WorkerBuilder {
        useAwsJobDefaults(): AwsDefaultJobWorkerBuilder;
    }
}