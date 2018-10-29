//"use strict";

const axios = require('axios');
const aws4  = require('aws4');


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
    constructor(servicesURL,authenticationToken) {
        let services = [];
       
        this.init = async () => {
            services.length = 0;
            
            let response = await httpAws4.get(servicesURL,authenticationToken);

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
//                              let response = await axios.get(serviceResource.httpEndpoint, { params: filter });
                            
                                let request = await httpAws4.generateSignedRequestAws4(serviceResource.httpEndpoint,null, 'GET',authenticationToken)   // need to modify the request before executing the GET
                                request.params = filter;  // add the filter parameter                             
                                let response = await axios(request);
                                
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
                                let response = await httpAws4.post(serviceResource.httpEndpoint, resource,authenticationToken);
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
            let response = await httpAws4.put(resource.id, resource,authenticationToken);
            return response.data;
        }

        this.delete = async (resource) => {
            await httpAws4.delete(resource.id,authenticationToken);
        }

        this.sendNotification = async (resource) => {
            if (resource.notificationEndpoint) {
                let notificationEndpoint = resource.notificationEndpoint;

                if (typeof notificationEndpoint === "string") {
                    let response = await httpAws4.get(notificationEndpoint,authenticationToken);
                    notificationEndpoint = response.data;
                }

                if (notificationEndpoint.httpEndpoint) {
                    let notification = new Notification(resource.id, resource);
                    await httpAws4.post(notificationEndpoint.httpEndpoint, notification,authenticationToken);
                }
            }
        }
    }
}




class httpAws4 {

        
       static   extractHostname(url) {
            var hostname;
            if (url.indexOf("//") > -1) {
                hostname = url.split('/')[2];
            }
            else {
                hostname = url.split('/')[0];
            }
            hostname = hostname.split(':')[0];
            hostname = hostname.split('?')[0];
            return hostname;
        }
        

        static async post(url,data,authenticationToken)  {
              return await httpAws4.makeRequestAws4(url,data, 'POST',authenticationToken);
        }
  
        static async put(url,data,authenticationToken)  {
              return await httpAws4.makeRequestAws4(url,data, 'PUT',authenticationToken);
        }
  
        static async get(url,authenticationToken)  {
              return await httpAws4.makeRequestAws4(url,'', 'GET',authenticationToken);
        }
  
        static async delete(url,authenticationToken)  {
              return await httpAws4.makeRequestAws4(url,'', 'DELETE',authenticationToken);
        }
  
        static async patch(url,data,authenticationToken)  {
              return await httpAws4.makeRequestAws4(url,'', 'PATCH',authenticationToken);
        }
  
      
      
       static async generateSignedRequestAws4(url,data, httpOperation,authenticationToken)  {
            let signedRequest ;
            let useAuthenticationToken = false;
            try {
               
                
               if ( typeof authenticationToken !== 'undefined' && authenticationToken ) {
                     useAuthenticationToken = true;
                } else {
                    console.log("WARNING: Trying to make a secure request to " + url + " without passing an authenticationToken") 
                }
                
                let hostname = httpAws4.extractHostname(url);
                let path = url.replace("http://","").replace("https://","").replace(hostname,"");

               let request = {
                    host: hostname ,
                    method: httpOperation,
                    url: url,
                    data: data, // payload
                    body: data ? JSON.stringify(data) : undefined,
                    path: path ,
                    headers: {
                      'content-type': 'application/json'
                    }
                }
  
  
                if (useAuthenticationToken == true) {
     
                     signedRequest = aws4.sign(request,
                        {
                          // assumes user has authenticated and we have called
                          // AWS.config.credentials.get to retrieve keys and
                          // session tokens
                          secretAccessKey: authenticationToken.secretAccessKey,
                          accessKeyId: authenticationToken.accessKeyId,
                          sessionToken: authenticationToken.sessionToken
                    })
                      
                    delete signedRequest.headers['Host']; 
                    delete signedRequest.headers['Content-Length'];
                  
                } else {
                    signedRequest = request;
                }
                  
            } catch (error) {
                console.error("Failed to generate request : " + error );
            }

          return signedRequest;
        }     
      
      
        
        
        static async makeRequestAws4(url,data, httpOperation,authenticationToken)  {
            let result ;
            
            try {
                let signedRequest = await httpAws4.generateSignedRequestAws4(url,data, httpOperation,authenticationToken);
                //  console.log("signedRequest==>",signedRequest); // uncomment to debug
                let response = await axios(signedRequest);
                result = response;
            } catch (error) {
                console.error("Failed to " + httpOperation + " for " + url + "' error message : " + error );
            }

          return result;
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
    HTTPAWS4: httpAws4
}
