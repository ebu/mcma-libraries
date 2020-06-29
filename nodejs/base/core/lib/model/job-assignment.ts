import { JobBase, JobBaseProperties } from "./job-base";
import { McmaTracker, McmaTrackerProperties } from "./mcma-tracker";
import { NotificationEndpoint, NotificationEndpointProperties } from "./notification-endpoint";

export interface JobAssignmentProperties extends JobBaseProperties {
    job: string;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;
}

export class JobAssignment extends JobBase<JobAssignmentProperties> implements JobAssignmentProperties {
    job: string;
    tracker?:  McmaTrackerProperties;
    notificationEndpoint?: NotificationEndpointProperties;

    constructor(properties: JobAssignmentProperties) {
        super("JobAssignment", properties);

        this.checkProperty("job", "url");
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
