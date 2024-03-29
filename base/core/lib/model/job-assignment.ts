import { JobBase, JobBaseProperties } from "./job-base";
import { McmaTracker, McmaTrackerProperties } from "./mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "./notification-endpoint";
import { Utils } from "../utils";

export interface JobAssignmentProperties extends JobBaseProperties {
    jobId: string;
    tracker?: McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class JobAssignment extends JobBase<JobAssignmentProperties> implements JobAssignmentProperties {
    jobId: string;
    tracker?: McmaTracker;
    notificationEndpoint?: NotificationEndpoint;

    constructor(properties: JobAssignmentProperties) {
        super("JobAssignment", properties);
        this.jobId = properties.jobId;
        if (typeof properties.tracker === "object") {
            this.tracker = new McmaTracker(properties.tracker);
        }
        if (typeof properties.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(properties.notificationEndpoint);
        }

        Utils.checkProperty(this, "jobId", "url");
        Utils.checkProperty(this, "tracker", "object", false);
        Utils.checkProperty(this, "notificationEndpoint", "object", false);
    }
}
