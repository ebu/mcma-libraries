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

class AsyncEndpoint {
    constructor(success, failure) {
        this["@type"] = "AsyncEndpoint";
        this.asyncSuccess = success;
        this.asyncFailure = failure;
    }
}

class AmeJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "AmeJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class CaptureJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "CaptureJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class QAJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "QAJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class TransferJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "TransferJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class TransformJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "TransformJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class WorkflowJob {
    constructor(jobProfile, jobInput, asyncEndpoint) {
        this["@type"] = "WorkflowJob";
        this.jobProfile = jobProfile;
        this.jobInput = jobInput;
        this.asyncEndpoint = asyncEndpoint;
    }
}

class JobProcess {
    constructor(job) {
        this["@type"] = "JobProcess";
        this.job = job;
    }
}

class JobAssignment {
    constructor(job) {
        this["@type"] = "JobAssignment";
        this.job = job;
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
        }

        this.update = async (resource) => {
            let response = await axios.put(resource.id, resource);
            return response.data;
        }

        this.delete = async (resource) => {
            await axios.delete(resource.id);
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
    AsyncEndpoint: AsyncEndpoint,
    AmeJob: AmeJob,
    CaptureJob: CaptureJob,
    QAJob: QAJob,
    TransferJob: TransferJob,
    TransformJob: TransformJob,
    WorkflowJob: WorkflowJob,
    JobProcess: JobProcess,
    JobAssignment: JobAssignment,
    ResourceManager: ResourceManager,
    HTTP: axios
}
