//"use strict";

const axios = require("axios");

const validUrl = new RegExp("^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$", "i"); // fragment locater

const checkProperty = (object, propertyName, expectedType, required) => {
    const propertyValue = object[propertyName];
    const propertyType = typeof propertyValue;

    if (propertyValue === undefined || propertyValue === null) {
        if (required) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to be defined", null, object);
        }
        return;
    }

    if (expectedType === "resource") { // special MCMA type that can either be a URL referencing a resource or embedded object
        if ((propertyType !== "string" && propertyType !== "object") ||
            (propertyType === "string" && !validUrl.test(propertyValue)) ||
            (propertyType === "object" && Array.isArray(propertyValue))) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have a valid URL or an object", null, object);
        }
    } else if (expectedType === "url") {
        if (propertyType !== "string" || !validUrl.test(propertyValue)) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have a valid URL", null, object);
        }
    } else if (expectedType === "Array") {
        if (!Array.isArray(propertyValue)) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type Array", null, object);
        }
    } else if (expectedType === "object") {
        if (propertyType !== "object" || Array.isArray(propertyValue)) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type object", null, object);
        }
    } else {
        if (expectedType !== propertyType) {
            throw new Exception("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type " + expectedType, null, object);
        }
    }
}

const onResourceCreate = (resource, id) => {
    resource.id = id;
    resource.dateModified = resource.dateCreated = new Date().toISOString();
};

const onResourceUpsert = (resource, id) => {
    resource.id = id;
    resource.dateModified = new Date().toISOString();
    if (!resource.dateCreated) {
        resource.dateCreated = resource.dateModified;
    }
};

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

        this.onCreate = (id) => onResourceCreate(this, id);
        this.onUpsert = (id) => onResourceUpsert(this, id);
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

        const httpClient = new HttpClient();

        const getAuthenticator = async () => {
            if (!authProvider) {
                return null;
            }

            if (typeof authProvider.getAuthenticator !== "function") {
                throw new Exception("ResourceEndpoint: Provided authProvider does not define the required getAuthenticator(authType, authContext) function.", null, this);
            }

            try {
                return await authProvider.getAuthenticator(this.authType || serviceAuthType, this.authContext || serviceAuthContext);
            } catch (error) {
                throw new Exception("ResourceEndpoint: Error occurred while getting authenticator", error, this);
            }
        }

        this.request = async (config) => {
            config.baseURL = this.httpEndpoint;

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

            config.baseURL = this.httpEndpoint;

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

            config.baseURL = this.httpEndpoint;

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
            config.baseURL = this.httpEndpoint;

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
            config.baseURL = this.httpEndpoint;
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
            config.baseURL = this.httpEndpoint;
            httpClient.authenticator = await getAuthenticator();
            return await httpClient.delete(url, config);
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

class JobBase extends Resource {
    constructor(type, properties) {
        super(type, properties);

        checkProperty(this, "notificationEndpoint", "resource", false);
        checkProperty(this, "status", "string", false);
        checkProperty(this, "statusMessage", "string", false)
        checkProperty(this, "jobOutput", "resource", false);

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}

class Job extends JobBase {
    constructor(type, properties) {
        super(type, properties);

        checkProperty(this, "jobProfile", "resource", true);
        checkProperty(this, "jobInput", "resource", true);

        if (typeof this.jobProfile === "object") {
            this.jobProfile = new JobProfile(this.jobProfile);
        }
        if (typeof this.jobInput === "object") {
            this.jobInput = new JobParameterBag(this.jobInput);
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

class JobProcess extends JobBase {
    constructor(properties) {
        super("JobProcess", properties)

        checkProperty(this, "job", "resource");
    }
}

class JobAssignment extends JobBase {
    constructor(properties) {
        super("JobAssignment", properties)

        checkProperty(this, "job", "resource");
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
    constructor(config) {
        const httpClient = new HttpClient();

        const services = [];

        if (!config.servicesUrl) {
            throw new Exception("Missing property 'servicesUrl' in ResourceManager config")
        }

        this.init = async () => {
            try {
                services.length = 0;

                let serviceRegistry = new Service({
                    name: "Service Registry",
                    resources: [
                        new ResourceEndpoint({
                            resourceType: "Service",
                            httpEndpoint: config.servicesUrl,
                            authType: config.servicesAuthType,
                            authContext: config.servicesAuthContext
                        })
                    ]
                }, config.authProvider);

                services.push(serviceRegistry);

                let servicesEndpoint = serviceRegistry.getResourceEndpoint("Service");

                let response = await servicesEndpoint.get();

                for (const service of response.data) {
                    try {
                        services.push(new Service(service, config.authProvider));
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

            throw new Exception("ResourceManager: Failed to find service to create resource of type '" + resourceType + "'.");
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

            let response = await httpClient.put(resource.id, resource);
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

            let response = await httpClient.delete(resource.id);
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

                    let http = await this.getResourceEndpoint(notificationEndpoint.httpEndpoint);
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

class HttpClient {
    constructor(authenticator) {
        this.authenticator = authenticator;
    }

    async request(config) {
        if (!config) {
            throw new Exception("HttpClient: Missing configuration for making HTTP request");
        }

        if (config.method === undefined) {
            config.method = "GET";
        }

        if (config.baseURL) {
            if (!config.url) {
                config.url = config.baseURL;
            } else if (config.url.indexOf("http://") !== 0 && config.url.indexOf("https://") !== 0) {
                config.url = config.baseURL + config.url;
            } else if (!config.url.startsWith(config.baseURL)) {
                throw new Exception("HttpClient: Making " + config.method + " request to URL '" + config.url + "' which does not match baseURL '" + config.baseURL + "'");
            }
        }

        if (!config.url) {
            throw new Exception("HttpClient: Missing url in request config");
        }

        if (this.authenticator) {
            // if an authenticator was provided, ensure that it"s valid
            if (typeof this.authenticator.sign !== "function") {
                throw new Exception("HttpClient: Provided authenticator does not define the required sign() function.");
            }

            this.authenticator.sign(config);
        }

        // send request using axios
        try {
            return await axios(config);
        } catch (error) {
            throw new Exception("HttpClient: " + config.method + " request to " + config.url + " failed!", error, { config, response: error.response.data });
        }
    }

    async get(url, config) {
        config = config || {};
        config.url = url;
        config.method = "GET";
        return await this.request(config)
    }

    async post(url, data, config) {
        config = config || {};
        config.url = url;
        config.method = "POST";
        config.data = data;
        return await this.request(config)
    }

    async put(url, data, config) {
        config = config || {};
        config.url = url;
        config.method = "PUT";
        config.data = data;
        return await this.request(config)
    }

    async patch(url, data, config) {
        config = config || {};
        config.url = url;
        config.method = "PATCH";
        config.data = data;
        return await this.request(config)
    }

    async delete(url, config) {
        config = config || {};
        config.url = url;
        config.method = "DELETE";
        return await this.request(config)
    }
}

class AuthenticatorProvider {
    constructor(getAuthenticator) {
        this.getAuthenticator = getAuthenticator;
    }
}

class Exception extends Error {
    constructor(message, cause, context) {
        if (typeof message === "object" && context === undefined) {
            context = cause;
            cause = message;
            message = null;
        }
        super(message)
        this.cause = cause;
        this.context = context;
    }

    toString() {
        let ret = "";

        let c = this
        while (c) {
            if (c.stack) {
                ret += c.stack;
            } else {
                ret += "Error: " + c.message;
            }

            if (c.context) {
                ret += "\nContext:\n" + JSON.stringify(c.context, null, 2)
            }

            c = c.cause;
            if (c) {
                ret += "\nCaused by:\n";
            }
        }

        return ret;
    }
}

class JobStatus {
    constructor(name) {
        this.name = name;
        
        this.equals = (compareTo) => {
            if (typeof compareTo === "object") {
                compareTo = compareTo.name;
            }
            
            return typeof compareTo === "string" && this.name.toLowerCase() === compareTo.toLowerCase();
        };
    }
};
JobStatus.queued = new JobStatus("QUEUED");
JobStatus.scheduled = new JobStatus("SCHEDULED");
JobStatus.running = new JobStatus("RUNNING");
JobStatus.completed = new JobStatus("COMPLETED");
JobStatus.failed = new JobStatus("FAILED");

module.exports = {
    onResourceCreate,
    onResourceUpsert,
    Resource,
    Service,
    ResourceEndpoint,
    BMContent,
    BMEssence,
    DescriptiveMetadata,
    TechnicalMetadata,
    JobProfile,
    JobParameter,
    JobParameterBag,
    Locator,
    AIJob,
    AmeJob,
    CaptureJob,
    QAJob,
    TransferJob,
    TransformJob,
    WorkflowJob,
    JobProcess,
    JobAssignment,
    Notification,
    NotificationEndpoint,
    ResourceManager,
    HttpClient,
    AuthenticatorProvider,
    Exception,
    JobStatus,
    JobBase,
    Job
}
