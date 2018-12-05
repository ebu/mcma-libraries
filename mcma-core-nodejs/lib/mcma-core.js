//"use strict";

const axios = require('axios');

class Service {
    constructor(name, resources, jobType, jobProfiles, inputLocations, outputLocations) {
        this["@type"] = "Service";
        this.name = name;
        this.resources = resources;
        this.jobType = jobType;
        this.jobProfiles = jobProfiles;
        this.inputLocations = inputLocations;
        this.outputLocations = outputLocations;
    }
}

class ServiceResource {
    constructor(resourceType, httpEndpoint) {
        this["@type"] = "ServiceResource";
        this.resourceType = resourceType;
        this.httpEndpoint = httpEndpoint;
    }
}

class BMContent {
    constructor(properties) {
        this["@type"] = "BMContent";

        if (properties) {
            for (const prop in properties) {
                this[prop] = properties[prop];
            }
        }
    }
}

class BMEssence {
    constructor(properties) {
        this["@type"] = "BMEssence";

        if (properties) {
            for (const prop in properties) {
                this[prop] = properties[prop];
            }
        }
    }
}

class DescriptiveMetadata {
    constructor(properties) {
        this["@type"] = "DescriptiveMetadata";

        if (properties) {
            for (const prop in properties) {
                this[prop] = properties[prop];
            }
        }
    }
}

class TechnicalMetadata {
    constructor(properties) {
        this["@type"] = "TechnicalMetadata";

        if (properties) {
            for (const prop in properties) {
                this[prop] = properties[prop];
            }
        }
    }
}

class JobProfile {
    constructor(name, inputParameters, outputParameters, optionalInputParameters) {
        this["@type"] = "JobProfile";
        this.name = name;
        this.inputParameters = inputParameters;
        this.outputParameters = outputParameters;
        this.optionalInputParameters = optionalInputParameters;
    }
}

class JobParameter {
    constructor(parameterName, parameterType) {
        this["@type"] = "JobParameter";
        this.parameterName = parameterName;
        this.parameterType = parameterType;
    }
}

class JobParameterBag {
    constructor(jobParameters) {
        this["@type"] = "JobParameterBag";

        if (jobParameters) {
            for (const prop in jobParameters) {
                this[prop] = jobParameters[prop];
            }
        }
    }
}

class Locator {
    constructor(properties) {
        this["@type"] = "Locator";

        if (properties) {
            for (const prop in properties) {
                this[prop] = properties[prop];
            }
        }
    }
}

class AIJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "AIJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class AmeJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "AmeJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class CaptureJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "CaptureJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class QAJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "QAJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class TransferJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "TransferJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class TransformJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "TransformJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class WorkflowJob {
    constructor(jobProfile, jobInput, notificationEndpoint) {
        this["@type"] = "WorkflowJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class JobProcess {
    constructor(job, notificationEndpoint) {
        this["@type"] = "JobProcess";
        this.job = job;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class JobAssignment {
    constructor(job, notificationEndpoint) {
        this["@type"] = "JobAssignment";
        this.job = job;
        this.notificationEndpoint = notificationEndpoint;
    }
}

class Notification {
    constructor(source, content) {
        this["@type"] = "Notification";
        this.source = source;
        this.content = content;
    }
}

class NotificationEndpoint {
    constructor(httpEndpoint) {
        this["@type"] = "NotificationEndpoint";
        this.httpEndpoint = httpEndpoint;
    }
}

class ResourceManager {
    constructor(servicesURL, authenticator) {
        let services = [];

        this.authenticatedHttp = new AuthenticatedHttp(authenticator);
       
        this.init = async () => {
            services.length = 0;
            
            let response = await this.authenticatedHttp.get(servicesURL);

            services.push(...(response.data));

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
                services.push(new Service("Service Registry", [new ServiceResource("Service", servicesURL)]));
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

class AuthenticatedHttp {
    constructor(authenticator) {
        async function sendAuthenticatedRequest(method, url, data)  {
            // build request
            const request = { method, url, data };

            // content type is always JSON? will this always be true?
            request.headers = { 'Content-Type': 'application/json' };

            // allow requests without authentication, but log a warning
            if (!authenticator) {
                console.warn("WARNING: Trying to make a secure request to " + url + " without passing an authenticator") 
            } else {
                // if an authenticator was provided, ensure that it's valid
                if (typeof authenticator.sign !== 'function') {
                    throw new Error('Provided authenticator does not define the required sign() function.');
                }

                console.log('Signing request with authenticator', authenticator);
                try {
                    // use the authenticator to sign the request
                    authenticator.sign(request);
                } catch (e) {
                    console.error('Failed to sign request with authenticator', authenticator, e);
                }
            }

            // send request using axios
            const response = await axios(request);

            if (response.status >= 400) {
                console.error('Failed to send request to ' + request.url + '. Response code is ' + response.status);
                throw new Error('HTTP request failed with status code (' + response.status + ') ' + response.statusText);
            }

            return response;
        }

        this.post = async (url, data) => {
            console.log('AuthenticatedHttp.post()');
            return await sendAuthenticatedRequest('POST', url, data);
        };
        this.put = async (url, data) => {
            console.log('AuthenticatedHttp.put()');
            return await sendAuthenticatedRequest('PUT', url, data);
        };
        this.get = async (url) => {
            console.log('AuthenticatedHttp.get()');
            return await sendAuthenticatedRequest('GET', url, '');
        };
        this.delete = async (url) => {
            console.log('AuthenticatedHttp.delete()');
            return await sendAuthenticatedRequest('DELETE', url, '');
        };
        this.patch = async (url, data) => {
            console.log('AuthenticatedHttp.patch()');
            return await sendAuthenticatedRequest('PATCH', url, data);
        };
    }
}

module.exports = {
    Service: Service,
    ServiceResource: ServiceResource,
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
    HTTP: axios,
    AuthenticatedHttp: AuthenticatedHttp
}
