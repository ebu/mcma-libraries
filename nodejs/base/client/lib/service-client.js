const { ResourceEndpointClient } = require("./resource-endpoint-client");

class ServiceClient {
    constructor(service, authProvider) {
        const endpointsMap = {};

        for (const resourceEndpoint of service.resources) {
            endpointsMap[resourceEndpoint.resourceType] =
                new ResourceEndpointClient(resourceEndpoint, authProvider, service.authType, service.authContext);
        }

        this.hasResourceEndpoint = (resourceType) => {
            if (typeof resourceType === "function" && resourceType.name) {
                resourceType = resourceType.name;
            }
            return endpointsMap[resourceType] !== undefined;
        };

        this.getResourceEndpointClient = (resourceType) => {
            if (typeof resourceType === "function" && resourceType.name) {
                resourceType = resourceType.name;
            }
            return endpointsMap[resourceType];
        };

        this.getAllResourceEndpointClients = () => {
            return Object.keys(endpointsMap).map(k => endpointsMap[k]);
        };
    }
}

module.exports = {
    ServiceClient
};