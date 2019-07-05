const { ResourceEndpointClient } = require("./resource-endpoint-client");

class ServiceClient {
    constructor(service, authProvider) {
        const endpointsMap = {};

        for (let i = 0; i < service.resources.length; i++) {
            endpointsMap[resourceEndpointClient.resourceType] =
                new ResourceEndpointClient(resources[i], authProvider, service.authType, service.authContext);
        }

        this.hasResourceEndpoint = (resourceType) => {
            if (typeof resourceType === "function" && resourceType.name) {
                resourceType = resourceType.name;
            }
            return endpointsMap[resourceType] !== undefined;
        };

        this.getResourceEndpoint = (resourceType) => {
            if (typeof resourceType === "function" && resourceType.name) {
                resourceType = resourceType.name;
            }
            return endpointsMap[resourceType];
        };

        this.getAllResourceEnpdoints = () => {
            return Object.keys(endpointsMap).map(k => endpointsMap[k]);
        };
    }
}

module.exports = {
    ServiceClient
};