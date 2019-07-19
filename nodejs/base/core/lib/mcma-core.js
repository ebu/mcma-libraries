//"use strict";

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
};

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
    constructor(properties) {
        super("Service", properties);

        checkProperty(this, "name", "string", true);
        checkProperty(this, "resources", "Array", true);
        checkProperty(this, "authType", "string", false);
        checkProperty(this, "jobType", "string", false);
        checkProperty(this, "jobProfiles", "Array", false);

        for (let i = 0; i < this.resources.length; i++) {
            this.resources[i] = new ResourceEndpoint(this.resources[i]);
        }

        if (this.jobProfiles !== undefined) {
            for (let i = 0; i < this.jobProfiles.length; i++) {
                if (typeof jobProfile === "object") {
                    this.jobProfiles[i] = new JobProfile(this.jobProfiles[i]);
                }
            }
        }
    }
}

class ResourceEndpoint extends Resource {
    constructor(properties) {
        super("ResourceEndpoint", properties);

        checkProperty(this, "resourceType", "string", true);
        checkProperty(this, "httpEndpoint", "url", true);
        checkProperty(this, "authType", "string", false);
    }
}

class JobProfile extends Resource {
    constructor(properties) {
        super("JobProfile", properties);

        checkProperty(this, "inputParameters", "Array", false);
        checkProperty(this, "outputParameters", "Array", false);
        checkProperty(this, "optionalInputParameters", "Array", false);
    }
}

class JobParameter extends Resource {
    constructor(properties) {
        super("JobParameter", properties);

        checkProperty(this, "parameterName", "string", true);
        checkProperty(this, "parameterType", "string", false);
    }
}

class JobParameterBag extends Resource {
    constructor(properties) {
        super("JobParameterBag", properties);
    }
}

class Locator extends Resource {
    constructor(properties) {
        super("Locator", properties);
    }
}

class JobBase extends Resource {
    constructor(type, properties) {
        super(type, properties);

        checkProperty(this, "notificationEndpoint", "resource", false);
        checkProperty(this, "status", "string", false);
        checkProperty(this, "statusMessage", "string", false);
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
        super("AIJob", properties);
    }
}

class AmeJob extends Job {
    constructor(properties) {
        super("AmeJob", properties);
    }
}

class CaptureJob extends Job {
    constructor(properties) {
        super("CaptureJob", properties);
    }
}

class QAJob extends Job {
    constructor(properties) {
        super("QAJob", properties);
    }
}

class TransferJob extends Job {
    constructor(properties) {
        super("TransferJob", properties);
    }
}

class TransformJob extends Job {
    constructor(properties) {
        super("TransformJob", properties);
    }
}

class WorkflowJob extends Job {
    constructor(properties) {
        super("WorkflowJob", properties);
    }
}

class JobProcess extends JobBase {
    constructor(properties) {
        super("JobProcess", properties);

        checkProperty(this, "job", "resource");
    }
}

class JobAssignment extends JobBase {
    constructor(properties) {
        super("JobAssignment", properties);

        checkProperty(this, "job", "resource");
    }
}

class Notification extends Resource {
    constructor(properties) {
        super("Notification", properties);

        checkProperty(this, "source", "string", false);
        checkProperty(this, "content", "resource", true);
    }
}

class NotificationEndpoint extends Resource {
    constructor(properties) {
        super("NotificationEndpoint", properties);

        checkProperty(this, "httpEndpoint", "url", true);
    }
}

class BMContent extends Resource {
    constructor(properties) {
        super("BMContent", properties);
    }
}

class BMEssence extends Resource {
    constructor(properties) {
        super("BMEssence", properties);
    }
}

class DescriptiveMetadata extends Resource {
    constructor(properties) {
        super("DescriptiveMetadata", properties);
    }
}

class TechnicalMetadata extends Resource {
    constructor(properties) {
        super("TechnicalMetadata", properties);
    }
}

class Exception extends Error {
    constructor(message, cause, context) {
        if (typeof message === "object" && context === undefined) {
            context = cause;
            cause = message;
            message = null;
        }
        super(message);
        this.cause = cause;
        this.context = context;
    }

    toString() {
        let ret = "";

        let c = this;
        while (c) {
            if (c.stack) {
                ret += c.stack;
            } else {
                ret += "Error: " + c.message;
            }

            if (c.context) {
                ret += "\nContext:\n" + JSON.stringify(c.context, null, 2);
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
}

JobStatus.new = new JobStatus("NEW");
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
    Locator,
    JobStatus,
    JobBase,
    JobProcess,
    JobAssignment,
    Job,
    JobParameter,
    JobParameterBag,
    AIJob,
    AmeJob,
    CaptureJob,
    QAJob,
    TransferJob,
    TransformJob,
    WorkflowJob,
    Notification,
    NotificationEndpoint,
    Exception
};
