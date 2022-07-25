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

        Utils.checkProperty(this, "parentId", "string", false);
        Utils.checkProperty(this, "jobProfileId", "url", true);
        Utils.checkProperty(this, "jobInput", "object", false);
        Utils.checkProperty(this, "timeout", "number", false);
        Utils.checkProperty(this, "tracker", "object", false);
        Utils.checkProperty(this, "notificationEndpoint", "object", false);

        this.jobInput = new JobParameterBag(properties.jobInput);

        this.deadline = Utils.ensureValidDateOrUndefined(this.deadline);

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }
    }
}
