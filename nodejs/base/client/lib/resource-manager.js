const { Service, ResourceEndpoint } = require("@mcma/core");

const { HttpClient } = require("./http-client");
const { ServiceClient } = require("./service-client");

class ResourceManager {
    constructor(config) {
        const httpClient = new HttpClient();

        const serviceClients = [];

        if (!config.servicesUrl) {
            throw new Exception("Missing property 'servicesUrl' in ResourceManager config")
        }

        this.init = async () => {
            try {
                serviceClients.length = 0;

                let serviceRegistry = new Service({
                    name: "Service Registry",
                    resources: [
                        new ResourceEndpoint({
                            resourceType: Service,
                            httpEndpoint: config.servicesUrl,
                            authType: config.servicesAuthType,
                            authContext: config.servicesAuthContext
                        })
                    ]
                });

                let serviceRegistryClient = new ServiceClient(serviceRegistry, config.authProvider);

                serviceClients.push(serviceRegistryClient);

                let servicesEndpoint = serviceRegistryClient.getResourceEndpointClient("Service");

                let response = await servicesEndpoint.get();

                for (const service of response.data) {
                    try {
                        serviceClients.push(new ServiceClient(new Service(service), config.authProvider));
                    } catch (error) {
                        console.warn("Failed to instantiate json " + JSON.stringify(service) + " as a Service due to error " + error.message);
                    }
                }
            } catch (error) {
                throw new Exception("ResourceManager: Failed to initialize", error);
            }
        }

        this.get = async (resourceType, filter) => {
            if (typeof resourceType === "function" && resourceType.name) {
                resourceType = resourceType.name;
            }

            if (serviceClients.length === 0) {
                await this.init();
            }

            let result = [];

            let usedHttpEndpoints = {};

            for (const serviceClient of serviceClients) {
                let resourceEndpoint = serviceClient.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                try {
                    if (!usedHttpEndpoints[resourceEndpoint.httpEndpoint]) {
                        let response = await resourceEndpoint.get({ params: filter });
                        result.push(...(response.data));
                    }

                    usedHttpEndpoints[resourceEndpoint.httpEndpoint] = true;
                } catch (error) {
                    console.error("Failed to retrieve '" + resourceType + "' from endpoint '" + resourceEndpoint.httpEndpoint + "'");
                }
            }

            return result;
        }

        this.create = async (resource) => {
            if (serviceClients.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of serviceClients) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                let response = await resourceEndpoint.post(resource);
                return response.data;
            }

            throw new Exception("ResourceManager: Failed to find service to create resource of type '" + resourceType + "'.");
        }

        this.update = async (resource) => {
            if (serviceClients.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of serviceClients) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                if (resource.id.startsWith(resourceEndpoint.httpEndpoint)) {
                    let response = await resourceEndpoint.put(resource);
                    return response.data;
                }
            }

            let response = await httpClient.put(resource.id, resource);
            return response.data;
        }

        this.delete = async (resource) => {
            if (serviceClients.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of serviceClients) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                if (resource.id.startsWith(resourceEndpoint.httpEndpoint)) {
                    let response = await resourceEndpoint.delete(resource.id);
                    return response.data;
                }
            }

            let response = await httpClient.delete(resource.id);
            return response.data;
        }

        this.getResourceEndpointClient = async (url) => {
            if (serviceClients.length === 0) {
                await this.init();
            }

            for (const serviceClient of serviceClients) {
                for (const resourceEndpoint of serviceClient.getAllResourceEndpoints()) {
                    if (url.startsWith(resourceEndpoint.httpEndpoint)) {
                        return resourceEndpoint;
                    }
                }
            }
            return undefined;
        }

        this.resolve = async (resource) => {
            let resolvedResource;

            if (typeof resource === "string") {
                let http = await this.getResourceEndpointClient(resource)
                if (http === undefined) {
                    http = httpClient;
                }
                try {
                    let response = await http.get(resource);
                    resolvedResource = response.data;
                } catch (error) {
                    throw new Exception("ResourceManager: Failed to resolve resource from URL '" + resource + "'", error);
                }
            } else {
                resolvedResource = resource;
            }

            let resolvedType = typeof resolvedResource;
            if (resolvedType === "object") {
                if (Array.isArray(resolvedResource)) {
                    throw new Exception("ResourceManager: Resolved resource on URL '" + resource + "' has illegal type 'Array'");
                }
            } else {
                throw new Exception("ResourceManager: Resolved resource has illegal type '" + resolvedType + "'");
            }

            return resolvedResource;
        }

        this.sendNotification = async (resource) => {
            if (resource.notificationEndpoint) {
                try {
                    let notificationEndpoint = await this.resolve(resource.notificationEndpoint);

                    let http = await this.getResourceEndpointClient(notificationEndpoint.httpEndpoint);
                    if (http === undefined) {
                        http = httpClient;
                    }

                    let notification = new Notification({
                        source: resource.id,
                        content: resource
                    });
                    await http.post(notificationEndpoint.httpEndpoint, notification);
                } catch (error) {
                    throw new Exception("ResourceManager: Failed to send notification.", error);
                }
            }
        }
    }
}

module.exports = {
    ResourceManager
};