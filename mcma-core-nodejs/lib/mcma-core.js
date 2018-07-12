//"use strict";

// var async = require("async");
// var equal = require('fast-deep-equal');
// var request = require("request");

const Service = (name, resources, acceptsJobType, jobProfiles, inputLocations, outputLocations) => {
    this["@type"] = "Service";
    this.name = name;
    this.resources = resources;
    this.jobType = acceptsJobType;
    this.jobProfiles = jobProfiles;
    this.inputLocations = inputLocations;
    this.outputLocations = outputLocations;
}

const ServiceResource = (resourceType, httpEndpoint) => {
    this["@type"] = "ServiceResource";
    this.resourceType = resourceType;
    this.httpEndpoint = httpEndpoint;
}

const JobProfile = (name, inputParameters, outputParameters, optionalInputParameters) => {
    this["@type"] = "JobProfile";
    this.name = name;
    this.inputParameters = inputParameters;
    this.outputParameters = outputParameters;
    this.optionalInputParameters = optionalInputParameters;
}

const JobParameter = (parameterName, parameterType) => {
    this["@type"] = "JobParameter";
    this.parameterName = parameterName;
    this.parameterType = parameterType;
}

const JobParameterBag = (jobParameters) => {
    this["@type"] = "JobParameterBag";

    if (jobParameters) {
        for (var prop in jobParameters) {
            this[prop] = jobParameters[prop];
        }
    }
}

const Locator = (locatorProperties) => {
    this["@type"] = "Locator";

    if (locatorProperties) {
        for (var prop in locatorProperties) {
            this[prop] = locatorProperties[prop];
        }
    }
}

const AsyncEndpoint = (success, failure) => {
    this["@type"] = "AsyncEndpoint";
    this.asyncSuccess = success;
    this.asyncFailure = failure;
}

const AmeJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "AmeJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const CaptureJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "CaptureJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const QAJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "QAJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const TransferJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "TransferJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const TransformJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "TransformJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const WorkflowJob = (jobProfile, jobInput, asyncEndpoint) => {
    this["@type"] = "TransformJob";
    this.jobProfile = jobProfile;
    this.jobInput = jobInput;
    this.asyncEndpoint = asyncEndpoint;
}

const JobProcess = (job) => {
    this["@type"] = "JobProcess";
    this.job = job;
}

const JobAssignment = (job) => {
    this["@type"] = "JobAssignment";
    this.job = job;
}

/*const httpGet = (url, context, callback) => {
    if (!callback && typeof (context) === 'function') {
        callback = context;
        context = defaultContextURL;
    }

    async.waterfall([
        (callback) => {
            request({
                url: url,
                method: "GET",
                json: true
            }, callback);
        },
        (response, body, callback) => {
            if (response.statusCode !== 200) {
                return callback(response.statusCode, body);
            } else if (body) {
                if (body.constructor === Array) {
                    return async.map(body, (resource, callback) => {
                        return jsonld.compact(resource, context, (err, response) => {
                            callback(err, response);
                        });
                    }, callback);
                } else {
                    return jsonld.compact(body, context, (err, response) => {
                        return callback(err, response);
                    });
                }
            } else {
                return callback();
            }
        }
    ], callback);
}

const httpPost(url, resource, context, callback) {
    if (!callback && typeof (context) === 'function') {
        callback = context;
        context = defaultContextURL;
    }

    async.waterfall([
        (callback) => {
            request({
                url: url,
                method: "POST",
                json: true,
                body: resource
            }, callback);
        },
        (response, body, callback) => {
            if (response.statusCode !== 201) {
                return callback(response.statusCode, body);
            } else if (body) {
                if (body.constructor === Array) {
                    return async.map(body, (resource, callback) => {
                        return jsonld.compact(resource, context, (err, response) => {
                            return callback(err, response);
                        });
                    }, callback);
                } else {
                    return jsonld.compact(body, context, (err, response) => {
                        return callback(err, response);
                    });
                }
            } else {
                return callback();
            }
        }
    ], callback);
}

const httpPut(url, resource, context, callback) {
    if (!callback && typeof (context) === 'function') {
        callback = context;
        context = defaultContextURL;
    }

    async.waterfall([
        (callback) => {
            request({
                url: url,
                method: "PUT",
                json: true,
                body: resource
            }, callback);
        },
        (response, body, callback) => {
            if (response.statusCode !== 200) {
                return callback(response.statusCode, body);
            } else if (body) {
                if (body.constructor === Array) {
                    return async.map(body, (resource, callback) => {
                        return jsonld.compact(resource, context, (err, response) => {
                            return callback(err, response);
                        });
                    }, callback);
                } else {
                    return jsonld.compact(body, context, (err, response) => {
                        return callback(err, response);
                    });
                }
            } else {
                return callback();
            }
        }
    ], callback);
}

const httpDelete(url, context, callback) {
    if (!callback && typeof (context) === 'function') {
        callback = context;
        context = defaultContextURL;
    }

    async.waterfall([
        (callback) => {
            request({
                url: url,
                method: "DELETE",
                json: true
            }, callback);
        },
        (response, body, callback) => {
            if (response.statusCode !== 200) {
                return callback(response.statusCode, body);
            } else if (body) {
                if (body.constructor === Array) {
                    return async.map(body, (resource, callback) => {
                        return jsonld.compact(resource, context, (err, response) => {
                            return callback(err, response);
                        });
                    }, callback);
                } else {
                    return jsonld.compact(body, context, (err, response) => {
                        return callback(err, response);
                    });
                }
            } else {
                return callback();
            }
        }
    ], callback);
}


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
    JobAssignment: JobAssignment
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
