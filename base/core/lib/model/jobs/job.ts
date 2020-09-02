import { JobBase, JobBaseProperties } from "../job-base";
import { JobParameterBag } from "../job-parameter-bag";
import { McmaTracker, McmaTrackerProperties } from "../mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "../notification-endpoint";

export interface JobProperties extends JobBaseProperties {
    parentId?: string;
    jobProfile: string;
    jobInput?: JobParameterBag;
    timeout?: number;
    deadline?: Date;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class Job extends JobBase<JobProperties> implements JobProperties {
    parentId?: string;
    jobProfile: string;
    jobInput?: JobParameterBag;
    timeout?: number;
    deadline?: Date;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;

    constructor(type: string, properties: JobProperties) {
        super(type, properties);

        this.checkProperty("parentId", "url", false);
        this.checkProperty("jobProfile", "url", true);
        this.checkProperty("jobInput", "object", false);
        this.checkProperty("timeout", "number", false);
        this.checkProperty("deadline", "object", false);
        this.checkProperty("tracker", "object", false);
        this.checkProperty("notificationEndpoint", "object", false);

        this.jobInput = new JobParameterBag(properties.jobInput);

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }
    }
}
