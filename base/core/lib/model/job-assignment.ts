import { JobBase, JobBaseProperties } from "./job-base";
import { McmaTracker, McmaTrackerProperties } from "./mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "./notification-endpoint";

export interface JobAssignmentProperties extends JobBaseProperties {
    jobId: string;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class JobAssignment extends JobBase<JobAssignmentProperties> implements JobAssignmentProperties {
    jobId: string;
    tracker?:  McmaTracker;
    notificationEndpoint?: NotificationEndpoint;

    constructor(properties: JobAssignmentProperties) {
        super("JobAssignment", properties);

        this.checkProperty("jobId", "url");
        this.checkProperty("tracker", "object", false);
        this.checkProperty("notificationEndpoint", "object", false);

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }
    }
}
