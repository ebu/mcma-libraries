import { JobBase, JobBaseProperties } from "../job-base";
import { JobParameterBag, JobParameterBagProperties } from "../job-parameter-bag";
import { McmaTracker, McmaTrackerProperties } from "../mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "../notification-endpoint";

export interface JobProperties extends JobBaseProperties {
    parentId?: string;
    jobProfileId: string;
    jobInput?: JobParameterBagProperties;
    timeout?: number;
    deadline?: Date | string;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class Job extends JobBase<JobProperties> implements JobProperties {
    parentId?: string;
    jobProfileId: string;
    jobInput?: JobParameterBag;
    timeout?: number;
    deadline?: Date;
    tracker?:  McmaTracker;
    notificationEndpoint?: NotificationEndpoint;

    constructor(type: string, properties: JobProperties) {
        super(type, properties);

        this.checkProperty("parentId", "string", false);
        this.checkProperty("jobProfileId", "url", true);
        this.checkProperty("jobInput", "object", false);
        this.checkProperty("timeout", "number", false);
        this.checkProperty("tracker", "object", false);
        this.checkProperty("notificationEndpoint", "object", false);

        this.jobInput = new JobParameterBag(properties.jobInput);

        this.deadline = this.ensureValidDateOrUndefined(this.deadline);

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }
    }
}
