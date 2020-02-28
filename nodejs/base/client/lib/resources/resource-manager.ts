import { McmaException, Service, ResourceEndpoint, Notification, McmaResource, McmaResourceType, NotificationEndpointProperties, NotificationEndpoint } from "@mcma/core";

import { Http, HttpClient } from "../http";
import { AuthProvider } from "../auth";

import { ServiceClient } from "./service-client";
import { ResourceManagerConfig } from "./resource-manager-config";
import { ResourceEndpointClient } from "./resource-endpoint-client";

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

            let response = await servicesEndpoint.get();

            for (const service of response.data) {
                try {
                    this.serviceClients.push(new ServiceClient(new Service(service), this.authProvider));
                } catch (error) {
                    console.warn("Failed to instantiate json " + JSON.stringify(service) + " as a Service due to error " + error.message);
                }
            }
        } catch (error) {
            throw new McmaException("ResourceManager: Failed to initialize", error);
        }
    };

    async query<T extends McmaResource>(resourceType: McmaResourceType<T>, filter?: any): Promise<T[] | null> {
        if (typeof resourceType === "function" && resourceType.name) {
            resourceType = resourceType.name;
        }

        if (this.serviceClients.length === 0) {
            await this.init();
        }

        const result: T[] = [];
        const usedHttpEndpoints: string[] = [];
        const errors: Error[] = [];

        for (const serviceClient of this.serviceClients) {
            let resourceEndpoint = serviceClient.getResourceEndpointClient(resourceType);
            if (resourceEndpoint === undefined) {
                continue;
            }

            try {
                if (!usedHttpEndpoints[resourceEndpoint.httpEndpoint]) {
                    let response = await resourceEndpoint.get<T[]>({ params: filter });
                    result.push(...(response.data));
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

        return result;
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

    async get<T extends McmaResource>(resource: T | string): Promise<T | null> {
        let resolvedResource: T;

        if (typeof resource === "string") {
            let http: Http = await this.getResourceEndpointClient(resource) || this.httpClient;
            try {
                let response = await http.get<T>(resource);
                resolvedResource = response.data;
            } catch (error) {
                throw new McmaException("ResourceManager: Failed to get resource from URL '" + resource + "'", error);
            }
        } else {
            resolvedResource = resource;
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
            throw new Error("Unexpected input of type '" + typeof resource + "' for ResourceManager.delete");
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

    async sendNotification<T extends McmaResource>(resource: T & { notificationEndpoint?: NotificationEndpointProperties | string }): Promise<void> {
        if (resource.notificationEndpoint) {
            try {
                let notificationEndpoint: NotificationEndpointProperties;
                if (typeof resource.notificationEndpoint === "string") {
                    notificationEndpoint = await this.get<NotificationEndpoint>(resource.notificationEndpoint);
                } else {
                    notificationEndpoint = resource.notificationEndpoint;
                }

                let http: Http = await this.getResourceEndpointClient(notificationEndpoint.httpEndpoint) || this.httpClient;

                let notification = new Notification({
                    source: resource.id,
                    content: resource
                });
                await http.post(notification, notificationEndpoint.httpEndpoint);
            } catch (error) {
                throw new McmaException("ResourceManager: Failed to send notification.", error);
            }
        }
    };
}