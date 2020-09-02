import { McmaException, McmaResource, McmaResourceType, Notification, NotificationEndpointProperties, ResourceEndpoint, Service, ServiceProperties } from "@mcma/core";

import { Http, HttpClient } from "../http";
import { AuthProvider } from "../auth";

import { ServiceClient } from "./service-client";
import { ResourceManagerConfig } from "./resource-manager-config";
import { ResourceEndpointClient } from "./resource-endpoint-client";

type QueryResults<T> = {
    results: T[];
    nextPageStartToken: string;
};

export class ResourceManager {
    private httpClient = new HttpClient();
    private serviceClients: ServiceClient[] = [];

    constructor(private config: ResourceManagerConfig, private authProvider: AuthProvider) {
        if (!config.servicesUrl) {
            throw new McmaException("Missing property 'servicesUrl' in ResourceManager config");
        }
    }

    async init(): Promise<void> {
        try {
            this.serviceClients.length = 0;

            let serviceRegistry = new Service({
                name: "Service Registry",
                resources: [
                    new ResourceEndpoint({
                        resourceType: "Service",
                        httpEndpoint: this.config.servicesUrl,
                        authType: this.config.servicesAuthType,
                        authContext: this.config.servicesAuthContext
                    })
                ]
            });

            let serviceRegistryClient = new ServiceClient(serviceRegistry, this.authProvider);

            this.serviceClients.push(serviceRegistryClient);

            let servicesEndpoint = serviceRegistryClient.getResourceEndpointClient("Service");

            let response = await servicesEndpoint.get<QueryResults<ServiceProperties>>();

            for (const service of response.data.results) {
                try {
                    if (service.name === serviceRegistry.name) {
                        this.serviceClients.shift();
                    }
                    this.serviceClients.push(new ServiceClient(new Service(service), this.authProvider));
                } catch (error) {
                    console.warn("Failed to instantiate json " + JSON.stringify(service) + " as a Service due to error " + error.message);
                }
            }
        } catch (error) {
            throw new McmaException("ResourceManager: Failed to initialize", error);
        }
    };

    async query<T extends McmaResource>(
        resourceType: McmaResourceType<T>,
        filter?: any,
        sortBy?: string,
        sortAscending?: boolean
    ): Promise<T[]> {
        if (typeof resourceType === "function" && resourceType.name) {
            resourceType = resourceType.name;
        }

        if (this.serviceClients.length === 0) {
            await this.init();
        }

        const results: T[] = [];
        const usedHttpEndpoints: string[] = [];
        const errors: Error[] = [];
        
        let params: any = {};
        if (sortBy !== undefined && sortBy !== null) {
            params.sortBy = sortBy;
        }
        if (sortAscending !== undefined && sortAscending !== null) {
            params.sortAscending = sortAscending;
        }
        if (filter) {
            params = Object.assign(params, filter);
        }

        for (const serviceClient of this.serviceClients) {
            let resourceEndpoint = serviceClient.getResourceEndpointClient(resourceType);
            if (resourceEndpoint === undefined) {
                continue;
            }

            try {
                if (!usedHttpEndpoints.includes(resourceEndpoint.httpEndpoint)) {
                    let response = await resourceEndpoint.get<QueryResults<T>>({ params });
                    results.push(...response.data.results);
                }

                usedHttpEndpoints.push(resourceEndpoint.httpEndpoint);
            } catch (error) {
                const wrappingError = new McmaException("Failed to retrieve '" + resourceType + "' from endpoint '" + resourceEndpoint.httpEndpoint + "'", error);
                errors.push(wrappingError);
                console.error(wrappingError);
            }
        }

        if (errors.length > 0) {
            throw new McmaException("Failed to query any available resource endpoints for resource type '" + resourceType + "'\n" +
                                    "Errors:\n" + errors.join("\n"));
        }

        return results;
    }

    async create<T extends McmaResource>(resource: T): Promise<T> {
        if (this.serviceClients.length === 0) {
            await this.init();
        }

        let resourceType = resource["@type"];

        for (const service of this.serviceClients) {
            let resourceEndpoint = service.getResourceEndpointClient(resourceType);
            if (resourceEndpoint === undefined) {
                continue;
            }

            let response = await resourceEndpoint.post(resource);
            return response.data;
        }

        throw new McmaException("ResourceManager: Failed to find service to create resource of type '" + resourceType + "'.");
    };

    async get<T extends McmaResource>(resource: string): Promise<T | null> {
        let resolvedResource: T;

        let http: Http = await this.getResourceEndpointClient(resource) || this.httpClient;
        try {
            let response = await http.get<T>(resource);
            resolvedResource = response.data;
        } catch (error) {
            throw new McmaException("ResourceManager: Failed to get resource from URL '" + resource + "'", error);
        }

        if (!resolvedResource) {
            return null;
        }

        let resolvedType = typeof resolvedResource;
        if (resolvedType === "object") {
            if (Array.isArray(resolvedResource)) {
                throw new McmaException("ResourceManager: Resource at '" + resource + "' has illegal type 'Array'");
            }
        } else {
            throw new McmaException("ResourceManager: Resource has illegal type '" + resolvedType + "'");
        }

        return resolvedResource;
    }

    async update<T extends McmaResource>(resource: T): Promise<T> {
        if (this.serviceClients.length === 0) {
            await this.init();
        }

        let http: Http = await this.getResourceEndpointClient(resource.id) || this.httpClient;
        let response = await http.put(resource, resource.id);
        return response.data;
    }

    async delete<T extends McmaResource>(resource: T | string): Promise<T> {
        let resourceId: string;
        if (typeof resource === "string") {
            resourceId = resource;
        } else if (typeof resource === "object" && resource.id) {
            resourceId = resource.id;
        } else {
            throw new McmaException("Unexpected input of type '" + typeof resource + "' for ResourceManager.delete");
        }

        if (this.serviceClients.length === 0) {
            await this.init();
        }

        let http: Http = await this.getResourceEndpointClient(resourceId) || this.httpClient;
        let response = await http.delete(resourceId);
        return response.data;
    };

    async getResourceEndpointClient(url: string): Promise<ResourceEndpointClient | undefined> {
        if (this.serviceClients.length === 0) {
            await this.init();
        }

        for (const serviceClient of this.serviceClients) {
            for (const resourceEndpoint of serviceClient.getAllResourceEndpointClients()) {
                if (url.startsWith(resourceEndpoint.httpEndpoint)) {
                    return resourceEndpoint;
                }
            }
        }
        return undefined;
    };

    async sendNotification<T extends { id?: string, notificationEndpoint?: NotificationEndpointProperties }>(resource: T): Promise<void> {
        if (resource.notificationEndpoint) {
            try {
                let http: Http = await this.getResourceEndpointClient(resource.notificationEndpoint.httpEndpoint) ?? this.httpClient;

                let notification = new Notification({
                    source: resource.id,
                    content: resource
                });
                await http.post(notification, resource.notificationEndpoint.httpEndpoint);
            } catch (error) {
                throw new McmaException("ResourceManager: Failed to send notification.", error);
            }
        }
    };
}
