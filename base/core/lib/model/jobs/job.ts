import { JobBase, JobBaseProperties } from "../job-base";
import { JobParameterBag, JobParameterBagProperties } from "../job-parameter-bag";
import { McmaTracker, McmaTrackerProperties } from "../mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "../notification-endpoint";
import { Utils } from "../../utils";

export interface JobProperties extends JobBaseProperties {
    parentId?: string;
    jobProfileId: string;
    jobInput?: JobParameterBagProperties;
    timeout?: number;
    deadline?: Date | string;
    tracker?: McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class Job extends JobBase<JobProperties> implements JobProperties {
    parentId?: string;
    jobProfileId: string;
    jobInput?: JobParameterBag;
    timeout?: number;
    deadline?: Date;
    tracker?: McmaTracker;
    notificationEndpoint?: NotificationEndpoint;

    constructor(type: string, properties: JobProperties) {
        super(type, properties);
        this.parentId = properties.parentId;
        this.jobProfileId = properties.jobProfileId;
        this.jobInput = new JobParameterBag(properties.jobInput);
        this.timeout = properties.timeout;
        this.deadline = Utils.ensureValidDateOrUndefined(properties.deadline);
        if (typeof properties.tracker === "object") {
            this.tracker = new McmaTracker(properties.tracker);
        }
        if (typeof properties.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(properties.notificationEndpoint);
        }

        Utils.checkProperty(this, "parentId", "string", false);
        Utils.checkProperty(this, "jobProfileId", "url", true);
        Utils.checkProperty(this, "jobInput", "object", false);
        Utils.checkProperty(this, "timeout", "number", false);
        Utils.checkProperty(this, "tracker", "object", false);
        Utils.checkProperty(this, "notificationEndpoint", "object", false);
    }
}
