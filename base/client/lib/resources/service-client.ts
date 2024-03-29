import { ServiceProperties } from "@mcma/core";
import { ResourceEndpointClient } from "./resource-endpoint-client";
import { AuthProvider } from "../auth/auth-provider";
import { HttpClientConfig } from "../http";

export class ServiceClient {
    private endpointsMap: { [key: string]: ResourceEndpointClient } = {};

    constructor(service: ServiceProperties, authProvider: AuthProvider, httpClientConfig?: HttpClientConfig) {
        for (const resourceEndpoint of service.resources) {
            this.endpointsMap[resourceEndpoint.resourceType] =
                new ResourceEndpointClient(resourceEndpoint, authProvider, httpClientConfig, service.authType);
        }
    }

    private getResourceTypeName(resourceType: string | Function): string {
        return typeof resourceType === "function" && resourceType.name ? resourceType.name : resourceType as string;
    }

    hasResourceEndpoint(resourceType: string | Function): boolean {
        return this.endpointsMap[this.getResourceTypeName(resourceType)] !== undefined;
    }

    getResourceEndpointClient(resourceType: string | Function): ResourceEndpointClient | undefined {
        return this.endpointsMap[this.getResourceTypeName(resourceType)];
    }

    getAllResourceEndpointClients(): ResourceEndpointClient[] {
        return Object.keys(this.endpointsMap).map(k => this.endpointsMap[k]);
    }
}
