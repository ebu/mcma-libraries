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
            for (var prop in jobParameters) {
                this[prop] = jobParameters[prop];
            }
        }
    }
}

class Locator {
    constructor(locatorProperties) {
        this["@type"] = "Locator";

        if (locatorProperties) {
            for (var prop in locatorProperties) {
                this[prop] = locatorProperties[prop];
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
    constructor(servicesURL) {
        let services = [];

        this.init = async () => {
            services.length = 0;

            let response = await axios.get(servicesURL);

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
                                let response = await axios.get(serviceResource.httpEndpoint, { params: filter });
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
                                let response = await axios.post(serviceResource.httpEndpoint, resource);
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
            let response = await axios.put(resource.id, resource);
            return response.data;
        }

        this.delete = async (resource) => {
            await axios.delete(resource.id);
        }

        this.sendNotification = async (resource) => {
            if (resource.notificationEndpoint) {
                let notificationEndpoint = resource.notificationEndpoint;

                if (typeof notificationEndpoint === "string") {
                    let response = await axios.get(notificationEndpoint);
                    notificationEndpoint = response.data;
                }

                if (notificationEndpoint.httpEndpoint) {
                    let notification = new Notification(resource.id, resource);
                    await axios.post(notificationEndpoint.httpEndpoint, notification);
                }
            }
        }
    }
}

module.exports = {
    Service: Service,
    ServiceResource: ServiceResource,
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
    HTTP: axios
}
