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

class McmaObject {
    constructor(type, properties) {
        this["@type"] = type;

        if (properties) {
            for (const prop in properties) {
                if (properties.hasOwnProperty(prop) && prop !== "@type") {
                    this[prop] = properties[prop];
                }
            }
        }

        this.checkProperty = (propertyName, expectedType, required) => checkProperty(this, propertyName, expectedType, required);
    }
}

class McmaTracker extends McmaObject {
    constructor(properties) {
        super("McmaTracker", properties);

        this.checkProperty("id", "string", true);
        this.checkProperty("label", "string", true);
    }
}

class Resource extends McmaObject {
    constructor(type, properties) {
        super(type, properties);

        this.onCreate = (id) => onResourceCreate(this, id);
        this.onUpsert = (id) => onResourceUpsert(this, id);
    }
}

class Service extends Resource {
    constructor(properties) {
        super("Service", properties);

        this.checkProperty("name", "string", true);
        this.checkProperty("resources", "Array", true);
        this.checkProperty("authType", "string", false);
        this.checkProperty("jobType", "string", false);
        this.checkProperty("jobProfiles", "Array", false);

        if (properties.authContext) {
            if (typeof properties.authContext === "string") {
                try {
                    this.authContext = JSON.parse(properties.authContext);
                } catch {
                    this.authContext = properties.authContext;
                }
            } else {
                this.authContext = properties.authContext;
            }
        }

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

class ResourceEndpoint extends McmaObject {
    constructor(properties) {
        super("ResourceEndpoint", properties);

        this.checkProperty("resourceType", "string", true);
        this.checkProperty("httpEndpoint", "url", true);
        this.checkProperty("authType", "string", false);
    }
}

class JobProfile extends Resource {
    constructor(properties) {
        super("JobProfile", properties);

        this.checkProperty("inputParameters", "Array", false);
        this.checkProperty("outputParameters", "Array", false);
        this.checkProperty("optionalInputParameters", "Array", false);
    }
}

class JobParameter extends Resource {
    constructor(properties) {
        super("JobParameter", properties);

        this.checkProperty("parameterName", "string", true);
        this.checkProperty("parameterType", "string", false);
    }
}

class JobParameterBag extends McmaObject {
    constructor(properties) {
        super("JobParameterBag", properties);
    }
}

class Locator extends Resource {
    constructor(type, properties) {
        if (typeof type === "object" && !properties) {
            properties = type;
            type = "Locator";
        }
        super(type, properties);
    }
}

class JobBase extends Resource {
    constructor(type, properties) {
        super(type, properties);

        this.checkProperty("tracker", "object", false);
        this.checkProperty("notificationEndpoint", "resource", false);
        this.checkProperty("status", "string", false);
        this.checkProperty("statusMessage", "string", false);
        this.checkProperty("jobOutput", "resource", false);
        this.checkProperty("progress", "number", false);

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}

class Job extends JobBase {
    constructor(type, properties) {
        super(type, properties);

        this.checkProperty("jobProfile", "resource", true);
        this.checkProperty("jobInput", "resource", true);

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

        this.checkProperty("job", "resource");
    }
}

class JobAssignment extends JobBase {
    constructor(properties) {
        super("JobAssignment", properties);

        this.checkProperty("job", "resource");
    }
}

class Notification extends Resource {
    constructor(properties) {
        super("Notification", properties);

        this.checkProperty("source", "string", false);
        this.checkProperty("content", "resource", true);
    }
}

class NotificationEndpoint extends Resource {
    constructor(properties) {
        super("NotificationEndpoint", properties);

        this.checkProperty("httpEndpoint", "url", true);
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
                ret += "Error: " + (c.message) ? c.message : c;
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

const JobStatus = Object.freeze({
    New: "New",
    Queued: "Queued",
    Scheduled: "Scheduled",
    Running: "Running",
    Completed: "Completed",
    Failed: "Failed",
    Canceled: "Canceled",
});

module.exports = {
    onResourceCreate,
    onResourceUpsert,
    McmaObject,
    McmaTracker,
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
    Exception,
};
