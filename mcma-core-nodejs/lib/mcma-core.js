//"use strict";

const equal = require('fast-deep-equal');
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

        this.http = axios;

        this.init = async () => {
            services.length = 0;

            let response = await axios.get(servicesURL);

            services.push(...(response.data));

            // in order to bootstrap the resource manager we have to make sure that the services array contains 
            // the entry for the service registry itself, even if it's not present in the service registry.
            let serviceRegistryPresent = false;

            for (let i = 0; i < services.length; i++) {
                for (let j = 0; j < services[i].resources.length; j++) {
                    if (services[i].resources[j].resourceType === "Service" && services[i].resources[j].httpEndpoint === servicesURL) {
                        serviceRegistryPresent = true;
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

            for (let i = 0; i < services.length; i++) {
                for (let j = 0; j < services[i].resources.length; j++) {
                    if (services[i].resources[j].resourceType === resourceType) {
                        try {
                            let response = await axios.get(services[i].resources[j].httpEndpoint, { params: filter });
                            result.push(...(response.data));
                        } catch (error) {
                            console.error("Failed to retrieve '" + resourceType + "' from endpoint '" + services[i].resources[j].httpEndpoint + "'");
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

            for (let i = 0; i < services.length; i++) {
                for (let j = 0; j < services[i].resources.length; j++) {
                    if (services[i].resources[j].resourceType === resource["@type"]) {
                        try {
                            let response = await axios.post(services[i].resources[j].httpEndpoint, resource);
                            return response.data;
                        } catch (error) {
                            console.error("Failed to create resource of type '" + resource["@type"] + "' at endpoint '" + services[i].resources[j].httpEndpoint + "'");
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
/*

var serviceRegistryServicesURL;

const setServiceRegistryServicesURL(servicesURL) {
    serviceRegistryServicesURL = servicesURL;
}

const getServiceRegistryServicesURL() {
    return serviceRegistryServicesURL;
}

const getServices(context, callback) {
    if (!serviceRegistryServicesURL) {
        callback("Service Registry Services URL not set");
    }

    httpGet(serviceRegistryServicesURL, context, callback);
}

const getResourceURLs(type, callback) {
    async.waterfall([
        (callback) => {
            getServices(internalContext, callback);
        },
        (services, callback) => {
            var resourceURLs = [];

            services.forEach(service => {
                var hasResources = (service.hasResource.constructor === Array) ? Array.from(service.hasResource) : Array.of(service.hasResource);

                hasResources.forEach(hasResource => {
                    if (hasResource.resourceType === type) {
                        resourceURLs.push(hasResource.httpEndpoint);
                    }
                });
            });

            callback(null, resourceURLs);
        }
    ], callback);
}

const getResource(object, context, callback) {
    var type = typeof object;

    if (type === "object") {
        if (object.id) {
            object = object.id;
            type = "string";
        }
    }

    switch (type) {
        case "string":
            var url = object;
            return httpGet(url, context, callback);
        case "object":
            if (object.constructor === Array) {
                if (object.length > 1) {
                    return callback("getResource() does not work with arrays with more than 1 element");
                } else {
                    return callback(null, object[0]);
                }
            } else {
                return callback(null, object);
            }
            break;
        default:
            return callback("Cannot dereference object with type '" + type + "'");
    }
}

const postResource(type, resource, callback) {
    async.waterfall([
        (callback) => {
            return getResourceURLs(type, callback);
        },
        (resourceURLs, callback) => {
            if (resourceURLs.length === 0) {
                return callback("No resource URL found for type '" + type + "'");
            }
            return httpPost(resourceURLs[0], resource, callback);
        }
    ], callback);
}

const isValidJob(job, callback) {
    async.waterfall([
        (callback) => {
            return jsonld.compact(job, minimalContext, (err, job) => {
                return callback(err, job);
            });
        },
        (job, callback) => {
            if (!job["mcma:hasJobProfile"]) {
                return callback("Missing JobProfile");
            } else if (job["mcma:hasJobProfile"].constructor === Array && job["mcma:hasJobProfile"].length > 1) {
                return callback("Too many JobProfiles");
            } else {
                return getResource(job["mcma:hasJobProfile"], minimalContext, (err, jobProfile) => callback(err, job, jobProfile));
            }
        },
        (job, jobProfile, callback) => {
            if (jobProfile["@type"] !== "mcma:JobProfile") {
                return callback("JobProfile has wrong type '" + jobProfile["@type"] + "'");
            } else if (jobProfile["mcma:hasInputParameter"]) {
                var inputParameters = (jobProfile["mcma:hasInputParameter"].constructor === Array) ? Array.from(jobProfile["mcma:hasInputParameter"]) : Array.of(jobProfile["mcma:hasInputParameter"]);

                return async.each(inputParameters, (inputParameter, callback) => {
                    if (inputParameter["@type"] !== "mcma:JobParameter") {
                        return callback("Invalid JobProfile: inputParameter with wrong type '" + inputParameter["@type"] + "' detected");
                    } else if (!inputParameter["mcma:jobProperty"]) {
                        return callback("Invalid JobProfile: inputParameter without 'mcma:jobProperty' detected");
                    } else if (!inputParameter["mcma:jobProperty"].id) {
                        return callback("Invalid JobProfile: inputParameter with wrongly defined 'mcma:jobProperty' detected");
                    } else {
                        var inputPropertyName = inputParameter["mcma:jobProperty"].id;

                        if (!job["mcma:hasJobInput"]) {
                            return callback("Invalid Job: Missing required property 'mcma:hasJobInput'");
                        } else if (job["mcma:hasJobInput"].constructor === Array) {
                            return callback("Invalid Job: Required property 'mcma:hasJobInput' must not be an array");
                        } else if (!job["mcma:hasJobInput"][inputPropertyName]) {
                            return callback("Invalid Job: Missing required input parameter '" + inputPropertyName + "'");
                        } else if (inputParameter["mcma:jobParameterType"] && inputParameter["mcma:jobParameterType"].id && job["mcma:hasJobInput"][inputPropertyName]["@type"] !== inputParameter["mcma:jobParameterType"].id) {
                            return callback("Invalid Job: Required input parameter '" + inputPropertyName + "' has wrong type");
                        } else {
                            return callback();
                        }
                    }
                }, callback);
            } else {
                return callback();
            }
        }
    ], callback)
}

const canServiceAcceptJob(service, job, callback) {
    async.waterfall([
        (callback) => {
            return jsonld.compact(service, minimalContext, (err, service) => {
                return callback(err, service);
            });
        },
        (service, callback) => {
            return jsonld.compact(job, minimalContext, (err, job) => {
                return callback(err, service, job);
            });
        },
        (service, job, callback) => {
            if (!service["mcma:acceptsJobType"]) {
                return callback("Service does not accept JobType '" + job["@type"] + "'");
            } else {
                var acceptedJobTypes = (service["mcma:acceptsJobType"].constructor === Array) ? Array.from(service["mcma:acceptsJobType"]) : Array.of(service["mcma:acceptsJobType"]);

                var acceptsJobType = false;

                acceptedJobTypes.forEach(jobType => {
                    if (jobType.id === job["@type"]) {
                        acceptsJobType = true;
                    }
                });

                if (!acceptsJobType) {
                    return callback("Service does not accept JobType '" + job["@type"] + "'");
                } else {
                    if (!service["mcma:acceptsJobProfile"]) {
                        return callback("Service does not accept Job with specified Job Profile");
                    } else {
                        var acceptedJobProfiles = service["mcma:acceptsJobProfile"].constructor === Array ? Array.from(service["mcma:acceptsJobProfile"]) : Array.of(service["mcma:acceptsJobProfile"]);

                        var acceptsJobProfile = false;

                        acceptedJobProfiles.forEach(jobProfile => {
                            if (equal(jobProfile, job["mcma:hasJobProfile"])) {
                                acceptsJobProfile = true;
                            }
                        });

                        if (!acceptsJobProfile) {
                            return callback("Service does not accept Job with specified Job Profile");
                        } else {
                            return callback(null);
                        }
                    }
                }
            }
        },
    ], callback);
}

const getJobProfilesByLabel(jobType, jobProfileLabel, callback) {
    var jobProfiles = [];

    async.waterfall([
        (callback) => {
            return getServices(internalContext, callback);
        },
        (services, callback) => {
            return async.each(services, (service, callback) => {
                if (service.acceptsJobType && service.acceptsJobProfile) {
                    var acceptedJobTypes = (service.acceptsJobType.constructor === Array) ? Array.from(service.acceptsJobType) : Array.of(service.acceptsJobType);

                    var acceptsJobType = false;

                    acceptedJobTypes.forEach(acceptedJobType => {
                        if (acceptedJobType === jobType) {
                            acceptsJobType = true;
                        }
                    });

                    if (acceptsJobType) {
                        var acceptedJobProfiles = (service.acceptsJobProfile.constructor === Array) ? Array.from(service.acceptsJobProfile) : Array.of(service.acceptsJobProfile);
                        return async.each(acceptedJobProfiles, (acceptedJobProfile, callback) => {
                            return async.waterfall([
                                (callback) => {
                                    return getResource(acceptedJobProfile, internalContext, callback);
                                },
                                (jobProfile, callback) => {
                                    if (jobProfile.label !== jobProfileLabel) {
                                        return callback();
                                    }

                                    if (!jobProfile["@context"]) {
                                        jobProfile["@context"] = internalContext;
                                    }

                                    return jsonld.compact(jobProfile, defaultContextURL, (err, jobProfile) => {
                                        if (err) {
                                            return callback(err);
                                        }
                                        jobProfiles.push(jobProfile);
                                        callback();
                                    });
                                }
                            ], callback);
                        }, callback);
                    }
                }

                return callback();
            }, callback);
        }
    ], (err) => {
        return callback(err, jobProfiles);
    });
}
*/

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
    ResourceManager: ResourceManager
    // httpGet: httpGet,
    // httpPost: httpPost,
    // httpPut: httpPut,
    // httpDelete: httpDelete,
    // getServiceRegistryServicesURL: getServiceRegistryServicesURL,
    // setServiceRegistryServicesURL: setServiceRegistryServicesURL,
    // getServices: getServices,
    // getResourceURLs: getResourceURLs,
    // postResource: postResource,
    // isValidJob: isValidJob,
    // canServiceAcceptJob: canServiceAcceptJob,
    // getJobProfilesByLabel: getJobProfilesByLabel
}
