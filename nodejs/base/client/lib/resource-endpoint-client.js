const { HttpClient } = require("./http-client");

class ResourceEndpointClient {
    constructor(resourceEndpoint, authProvider, serviceAuthType, serviceAuthContext) {
        if (!resourceEndpoint) {
            throw new Error("resourceEndpoint cannot be null or undefined.");
        }
        this.httpEndpoint = resourceEndpoint.httpEndpoint;

        const httpClient = new HttpClient();


        const getAuthenticator = async () => {
            if (!authProvider) {
                return null;
            }

            if (typeof authProvider.getAuthenticator !== "function") {
                throw new Exception("ResourceEndpoint: Provided authProvider does not define the required getAuthenticator(authType, authContext) function.", null, resourceEndpoint);
            }

            try {
                return await authProvider.getAuthenticator(resourceEndpoint.authType || serviceAuthType, resourceEndpoint.authContext || serviceAuthContext);
            } catch (error) {
                throw new Exception("ResourceEndpoint: Error occurred while getting authenticator", error, resourceEndpoint);
            }
        }

        this.request = async (config) => {
            config.baseURL = resourceEndpoint.httpEndpoint;

            httpClient.authenticator = await getAuthenticator();
            return await httpClient.request(config);
        }

        this.get = async (url, config) => {
            if (typeof url === "object" && config === undefined) {
                config = url;
                url = undefined;
            }
            if (url === undefined) {
                url = "";
            }
            if (config === undefined) {
                config = {};
            }

            config.baseURL = resourceEndpoint.httpEndpoint;

            httpClient.authenticator = await getAuthenticator();
            return await httpClient.get(url, config);
        }

        this.post = async (url, data, config) => {
            if (typeof url === "object" && config === undefined) {
                config = data;
                data = url;
                url = undefined;
            }
            if (url === undefined) {
                url = "";
            }
            if (config === undefined) {
                config = {};
            }

            config.baseURL = resourceEndpoint.httpEndpoint;

            httpClient.authenticator = await getAuthenticator();
            return await httpClient.post(url, data, config);
        }

        this.put = async (url, data, config) => {
            if (typeof url === "object" && config === undefined) {
                config = data;
                data = url;
                url = undefined;
            }
            if (url === undefined && typeof data === "object") {
                url = data.id;
            }
            if (url === undefined) {
                url = "";
            }
            if (config === undefined) {
                config = {};
            }
            config.baseURL = resourceEndpoint.httpEndpoint;

            httpClient.authenticator = await getAuthenticator();
            return await httpClient.put(url, data, config);
        }

        this.patch = async (url, data, config) => {
            if (typeof url === "object" && typeof data === "object" && config === undefined) {
                config = data;
                data = url;
                url = undefined;
            }
            if (url === undefined) {
                url = data.id;
            }
            if (url === undefined) {
                url = "";
            }
            if (config === undefined) {
                config = {};
            }
            config.baseURL = resourceEndpoint.httpEndpoint;
            httpClient.authenticator = await getAuthenticator();
            return await httpClient.patch(url, data, config);
        }

        this.delete = async (url, config) => {
            if (typeof url === "object" && config === undefined) {
                config = url;
                url = undefined;
            }
            if (url === undefined) {
                url = "";
            }
            if (config === undefined) {
                config = {};
            }
            config.baseURL = resourceEndpoint.httpEndpoint;
            httpClient.authenticator = await getAuthenticator();
            return await httpClient.delete(url, config);
        }
    }
}

module.exports = {
    ResourceEndpointClient
};