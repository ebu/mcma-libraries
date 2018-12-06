//"use strict";

const axios = require('axios');

const validUrl = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater

const checkProperty = (object, propertyName, expectedType, required) => {
    const propertyValue = object[propertyName];
    const propertyType = typeof propertyValue;

    if (propertyValue === undefined || propertyValue === null) {
        if (required) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to be defined");
        }
        return;
    }

    if (expectedType === "resource") { // special MCMA type that can either be a URL referencing a resource or embedded object
        if ((propertyType !== "string" && propertyType !== "object") ||
            (propertyType === "string" && !validUrl.test(propertyValue)) ||
            (propertyType === "object" && Array.isArray(propertyValue))) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have a valid URL or an object");
        }
    } else if (expectedType === "url") {
        if (propertyType !== "string" || !validUrl.test(propertyValue)) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have a valid URL");
        }
    } else if (expectedType === "Array") {
        if (!Array.isArray(propertyValue)) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type Array");
        }
    } else if (expectedType === "object") {
        if (propertyType !== "object" || Array.isArray(propertyValue)) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type object");
        }
    } else {
        if (expectedType !== propertyType) {
            throw new Error("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type " + expectedType);
        }
    }
}

class Resource {
    constructor(type, properties) {
        this["@type"] = type;

        if (properties) {
            for (const prop in properties) {
                if (prop !== "@type") {
                    this[prop] = properties[prop];
                }
            }
        }
    }
}

class Service extends Resource {
    constructor(properties, authProvider) {
        super("Service", properties);

        checkProperty(this, "name", "string", true);
        checkProperty(this, "resources", "Array", true);
        checkProperty(this, "authType", "string", false);
        checkProperty(this, "jobType", "string", false);
        checkProperty(this, "jobProfiles", "Array", false);

        const endpointsMap = {};

        for (let i = 0; i < this.resources.length; i++) {
            const resourceEndpoint = new ResourceEndpoint(this.resources[i], authProvider, this.authType, this.authContext);
            endpointsMap[resourceEndpoint.resourceType] = resourceEndpoint;
            this.resources[i] = resourceEndpoint;
        }

        if (this.jobProfiles !== undefined) {
            for (let i = 0; i < this.jobProfiles.length; i++) {
                if (typeof jobProfile === "object") {
                    this.jobProfiles[i] = new JobProfile(this.jobProfiles[i]);
                }
            }
        }

        this.hasResourceEndpoint = (resourceType) => {
            return endpointsMap[resourceType] !== undefined;
        }

        this.getResourceEndpoint = (resourceType) => {
            return endpointsMap[resourceType];
        }
    }
}

class ResourceEndpoint extends Resource {
    constructor(properties, authProvider, serviceAuthType, serviceAuthContext) {
        super("ResourceEndpoint", properties)

        checkProperty(this, "resourceType", "string", true);
        checkProperty(this, "httpEndpoint", "url", true);
        checkProperty(this, "authType", "string", false);

        this.request = async (config) => {
            if (!config) {
                throw new Error("Missing configuration for making HTTP request");
            }
            if (config.method === undefined) {
                config.method = "GET";
            }

            if ((config.url.indexOf('http://') !== 0 && config.url.indexOf('https://') !== 0)) {
                config.url = config.baseURL + config.url;
            }

            if (!config.url.startsWith(this.httpEndpoint)) {
                console.warn("Making " + config.method + " request to URL '" + config.url + "' which is not managed by this Resource Endpoint '" + this.httpEndpoint + "'");
            }

            if (authProvider) {
                if (typeof authProvider.getAuthenticator !== 'function') {
                    throw new Error('Provided authProvider does not define the required getAuthenticator(authType, authContext) function.');
                }

                const authenticator = await authProvider.getAuthenticator(this.authType || serviceAuthType, this.authContext || serviceAuthContext);

                if (authenticator) {
                    // if an authenticator was provided, ensure that it's valid
                    if (typeof authenticator.sign !== 'function') {
                        throw new Error('Provided authenticator does not define the required sign() function.');
                    }

                    authenticator.sign(config);
                }
            }

            // send request using axios
            return await axios(config);
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
            config.url = url;
            config.method = "GET";
            config.baseURL = this.httpEndpoint;
            return await this.request(config)
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
            config.url = url;
            config.method = "POST";
            config.baseURL = this.httpEndpoint;
            config.data = data;
            return await this.request(config)
        }

        this.put = async (url, data, config) => {
            if (typeof url === "object" && config === undefined) {
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
            config.url = url;
            config.method = "PUT";
            config.baseURL = this.httpEndpoint;
            config.data = data;
            return await this.request(config)
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
            config.url = url;
            config.method = "PATCH";
            config.baseURL = this.httpEndpoint;
            config.data = data;
            return await this.request(config)
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
            config.url = url;
            config.method = "DELETE";
            config.baseURL = this.httpEndpoint;
            return await this.request(config)
        }
    }
}

class JobProfile extends Resource {
    constructor(properties) {
        super("JobProfile", properties)

        checkProperty(this, "inputParameters", "Array", false);
        checkProperty(this, "outputParameters", "Array", false);
        checkProperty(this, "optionalInputParameters", "Array", false);
    }
}

class JobParameter extends Resource {
    constructor(properties) {
        super("JobParameter", properties)

        checkProperty(this, "parameterName", "string", true);
        checkProperty(this, "parameterType", "string", false);
    }
}

class JobParameterBag extends Resource {
    constructor(properties) {
        super("JobParameterBag", properties)
    }
}

class Locator extends Resource {
    constructor(properties) {
        super("Locator", properties)
    }
}

class Job extends Resource {
    constructor(type, properties) {
        super(type, properties);

        checkProperty(this, "jobProfile", "resource", true);
        checkProperty(this, "jobInput", "resource", true);
        checkProperty(this, "notificationEndpoint", "resource", false);
        checkProperty(this, "status", "string", false);
        checkProperty(this, "statusMessage", "string", false)
        checkProperty(this, "jobOutput", "resource", false);

        if (typeof this.jobProfile === "object") {
            this.jobProfile = new JobProfile(this.jobProfile);
        }
        if (typeof this.jobInput === "object") {
            this.jobInput = new JobParameterBag(this.jobInput);
        }
        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}

class AIJob extends Job {
    constructor(properties) {
        super("AIJob", properties)
    }
}

class AmeJob extends Job {
    constructor(properties) {
        super("AmeJob", properties)
    }
}

class CaptureJob extends Job {
    constructor(properties) {
        super("CaptureJob", properties)
    }
}

class QAJob extends Job {
    constructor(properties) {
        super("QAJob", properties)
    }
}

class TransferJob extends Job {
    constructor(properties) {
        super("TransferJob", properties)
    }
}

class TransformJob extends Job {
    constructor(properties) {
        super("TransformJob", properties)
    }
}

class WorkflowJob extends Job {
    constructor(properties) {
        super("WorkflowJob", properties)
    }
}

class JobProcess extends Resource {
    constructor(properties) {
        super("JobProcess", properties)

        checkProperty(this, "job", "resource");
        checkProperty(this, "notificationEndpoint", "resource");

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}

class JobAssignment extends Resource {
    constructor(properties) {
        super("JobAssignment", properties)

        checkProperty(this, "job", "resource");
        checkProperty(this, "notificationEndpoint", "resource");

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}

class Notification extends Resource {
    constructor(properties) {
        super("Notification", properties)

        checkProperty(this, "source", "string", false)
        checkProperty(this, "content", "resource", true)
    }
}

class NotificationEndpoint extends Resource {
    constructor(properties) {
        super("NotificationEndpoint", properties)

        checkProperty(this, "httpEndpoint", "url", true)
    }
}

class BMContent extends Resource {
    constructor(properties) {
        super("BMContent", properties)
    }
}

class BMEssence extends Resource {
    constructor(properties) {
        super("BMEssence", properties)
    }
}

class DescriptiveMetadata extends Resource {
    constructor(properties) {
        super("DescriptiveMetadata", properties)
    }
}

class TechnicalMetadata extends Resource {
    constructor(properties) {
        super("TechnicalMetadata", properties)
    }
}

class ResourceManager {
    constructor(servicesURL, authenticator) {
        let services = [];

        this.authenticatedHttp = new AuthenticatedHttp(authenticator);

        this.init = async () => {
            services.length = 0;

            let response = await this.authenticatedHttp.get(servicesURL);

            for (const service of response.data) {
                services.push(new Service(service));
            }

            // in order to bootstrap the resource manager we have to make sure that the services array contains 
            // the entry for the service registry itself, even if it's not present in the service registry.
            let serviceRegistryPresent = false;

            for (const service of services) {
                if (service.resources) {
                    for (const serviceResource of service.resources) {
                        if (serviceResource.resourceType === "Service" && serviceResource.httpEndpoint === servicesURL) {
                            serviceRegistryPresent = true;
                        }
                    }
                }
            }

            if (!serviceRegistryPresent) {
                services.push(new Service({ name: "Service Registry", resources: [new ResourceEndpoint({ resourceType: "Service", httpEndpoint: servicesURL })] }));
            }
        }

        this.get = async (resourceType, filter) => {
            if (services.length === 0) {
                await this.init();
            }

            let result = [];

            for (const service of services) {
                if (service.resources) {
                    for (const serviceResource of service.resources) {
                        if (serviceResource.resourceType === resourceType) {
                            try {
                                let response = await this.authenticatedHttp.get(serviceResource.httpEndpoint, filter);
                                result.push(...(response.data));
                            } catch (error) {
                                console.error("Failed to retrieve '" + resourceType + "' from endpoint '" + serviceResource.httpEndpoint + "'");
                            }
                        }
                    }
                }
            }

            return result;
        }

        this.create = async (resource) => {
            if (services.length === 0) {
                await this.init();
            }

            for (const service of services) {
                if (service.resources) {
                    for (const serviceResource of service.resources) {
                        if (serviceResource.resourceType === resource["@type"]) {
                            try {
                                let response = await this.authenticatedHttp.post(serviceResource.httpEndpoint, resource);
                                return response.data;
                            } catch (error) {
                                console.error("Failed to create resource of type '" + resource["@type"] + "' at endpoint '" + serviceResource.httpEndpoint + "'");
                            }
                        }
                    }
                }
            }

            throw new Error("Failed to find service to create resource of type '" + resource["@type"] + "'.");
        }

        this.update = async (resource) => {
            let response = await this.authenticatedHttp.put(resource.id, resource);
            return response.data;
        }

        this.delete = async (resource) => {
            await this.authenticatedHttp.delete(resource.id);
        }

        this.sendNotification = async (resource) => {
            if (resource.notificationEndpoint) {
                let notificationEndpoint = resource.notificationEndpoint;

                if (typeof notificationEndpoint === "string") {
                    let response = await this.authenticatedHttp.get(notificationEndpoint);
                    notificationEndpoint = response.data;
                }

                if (notificationEndpoint.httpEndpoint) {
                    let notification = new Notification(resource.id, resource);
                    await this.authenticatedHttp.post(notificationEndpoint.httpEndpoint, notification);
                }
            }
        }
    }
}

class ResourceManager2 {
    constructor(authProvider, servicesURL, servicesAuthType, servicesAuthContext) {
        const services = [];

        this.init = async () => {
            services.length = 0;

            let serviceRegistry = new Service({
                name: "Service Registry",
                resources: [
                    new ResourceEndpoint({
                        resourceType: "Service",
                        httpEndpoint: servicesURL,
                        authType: servicesAuthType,
                        authContext: servicesAuthContext
                    })
                ]
            }, authProvider);

            services.push(serviceRegistry);

            let servicesEndpoint = serviceRegistry.getResourceEndpoint("Service");

            let response = await servicesEndpoint.get();

            for (const service of response.data) {
                services.push(new Service(service, authProvider));
            }
        }

        this.get = async (resourceType, filter) => {
            if (services.length === 0) {
                await this.init();
            }

            let result = [];

            let usedHttpEndpoints = {};

            for (const service of services) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
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
            if (services.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of services) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                let response = await resourceEndpoint.post(resource);
                return response.data;
            }

            throw new Error("Failed to find service to create resource of type '" + resourceType + "'.");
        }

        this.update = async (resource) => {
            if (services.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of services) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                if (resource.id.startsWith(resourceEndpoint.httpEndpoint)) {
                    let response = await resourceEndpoint.put(resource);
                    return response.data;
                }
            }

            let response = axios.put(resource.id, resource);
            return response.data;
        }

        this.delete = async (resource) => {
            if (services.length === 0) {
                await this.init();
            }

            let resourceType = resource["@type"];

            for (const service of services) {
                let resourceEndpoint = service.getResourceEndpoint(resourceType);
                if (resourceEndpoint === undefined) {
                    continue;
                }

                if (resource.id.startsWith(resourceEndpoint.httpEndpoint)) {
                    let response = await resourceEndpoint.delete(resource.id);
                    return response.data;
                }
            }

            let response = axios.delete(resource.id);
            return response.data;
        }

        this.getResourceEndpoint = async (url) => {
            if (services.length === 0) {
                await this.init();
            }

            for (const service of services) {
                for (const resourceEndpoint of service.resources) {
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
                let http = await this.getResourceEndpoint(resource)
                if (http === undefined) {
                    http = axios;
                }
                try {
                    let response = http.get(resource);
                    resolvedResource = response.data;
                } catch (error) {
                    throw new Error("Failed to resolve resource from URL '" + resource + "'");
                }
            } else {
                resolvedResource = resource;
            }

            let resolvedType = typeof resolvedResource;
            if (resolvedType === "object") {
                if (Array.isArray(resolvedResource)) {
                    throw new Error("Resolved resource has illegal type 'Array'");
                }
            } else {
                throw new Error("Resolved resource has illegal type '" + resolvedType + "'");
            }

            return resolvedResource;
        }

        this.sendNotification = async (resource) => {
            if (resource.notificationEndpoint) {
                let notificationEndpoint = await this.resolve(resource.notificationEndpoint);

                let http = await this.getResourceEndpoint(notificationEndpoint.httpEndpoint);
                if (http === undefined) {
                    http = axios;
                }

                let notification = new Notification(resource.id, resource);
                await http.post(notificationEndpoint.httpEndpoint, notification);
            }
        }
    }
}

class AuthenticatedHttp {
    constructor(authenticator) {
        async function sendAuthenticatedRequest(method, url, data) {
            // build request
            const request = { method, url, data };

            // content type is always JSON? will this always be true?
            request.headers = { 'Content-Type': 'application/json' };

            // allow requests without authentication, but log a warning
            if (!authenticator) {
                console.warn("WARNING: Trying to make a signed request to " + url + " without passing an authenticator")
            } else {
                // if an authenticator was provided, ensure that it's valid
                if (typeof authenticator.sign !== 'function') {
                    throw new Error('Provided authenticator does not define the required sign() function.');
                }

                try {
                    // use the authenticator to sign the request
                    authenticator.sign(request);
                } catch (e) {
                    console.error('Failed to sign request with authenticator', authenticator, e);
                }
            }

            // send request using axios
            return await axios(request);
        }

        this.post = async (url, data) => {
            return await sendAuthenticatedRequest('POST', url, data);
        };
        this.put = async (url, data) => {
            return await sendAuthenticatedRequest('PUT', url, data);
        };
        this.get = async (url) => {
            return await sendAuthenticatedRequest('GET', url, '');
        };
        this.delete = async (url) => {
            return await sendAuthenticatedRequest('DELETE', url, '');
        };
        this.patch = async (url, data) => {
            return await sendAuthenticatedRequest('PATCH', url, data);
        };
    }
}

module.exports = {
    Service: Service,
    ResourceEndpoint: ResourceEndpoint,
    BMContent: BMContent,
    BMEssence: BMEssence,
    DescriptiveMetadata: DescriptiveMetadata,
    TechnicalMetadata: TechnicalMetadata,
    JobProfile: JobProfile,
    JobParameter: JobParameter,
    JobParameterBag: JobParameterBag,
    Locator: Locator,
    AIJob: AIJob,
    AmeJob: AmeJob,
    CaptureJob: CaptureJob,
    QAJob: QAJob,
    TransferJob: TransferJob,
    TransformJob: TransformJob,
    WorkflowJob: WorkflowJob,
    JobProcess: JobProcess,
    JobAssignment: JobAssignment,
    Notification: Notification,
    NotificationEndpoint: NotificationEndpoint,
    ResourceManager: ResourceManager,
    ResourceManager2: ResourceManager2,
    AuthenticatedHttp: AuthenticatedHttp
}
