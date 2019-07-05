//import { Lambda } from "aws-sdk";
import { Resource, ResourceType } from "@mcma/core";
import { McmaApiRouteCollection, DefaultRoutesBuilderFactory, DefaultRouteCollectionBuilder } from "@mcma/api";

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