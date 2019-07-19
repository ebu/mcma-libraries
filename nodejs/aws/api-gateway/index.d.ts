//import { Lambda } from "aws-sdk";
import { McmaApiRouteCollection } from "@mcma/api";

export class ApiGatewayApiController {
    constructor(routes: McmaApiRouteCollection);

    handleRequest(event: any, context: any): Promise<{ statusCode: number, headers: { [key: string]: string }, body: any }>;
}

declare module "@mcma/api" {
    interface McmaApiRouteCollection {
        toApiGatewayApiController(): ApiGatewayApiController;
    }
}