import { JobParameterBag } from "./job-parameter-bag";
import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { McmaTracker, McmaTrackerProperties } from "./mcma-tracker";
import { NotificationEndpointProperties, NotificationEndpoint } from "./notification-endpoint";

export interface JobBaseProperties extends McmaResourceProperties {
    tracker?:  string | McmaTrackerProperties;
    notificationEndpoint?: string | NotificationEndpointProperties;
    status?: string;
    statusMessage?: string;
    jobInput?: JobParameterBag;
    jobOutput?: JobParameterBag;
    progress?: number;
}

export abstract class JobBase<T extends JobBaseProperties> extends McmaResource implements JobBaseProperties {
    tracker?: McmaTrackerProperties;
    notificationEndpoint?: string | NotificationEndpointProperties;
    status?: string;
    statusMessage?: string;
    jobInput?: JobParameterBag;
    jobOutput?: JobParameterBag;
    progress?: number;

    constructor(type: string, properties: T) {
        super(type, properties);

        this.checkProperty("tracker", "object", false);
        this.checkProperty("notificationEndpoint", "resource", false);
        this.checkProperty("status", "string", false);
        this.checkProperty("statusMessage", "string", false);
        this.checkProperty("jobInput", "resource", false);
        this.checkProperty("jobOutput", "resource", false);
        this.checkProperty("progress", "number", false);

        this.jobInput = new JobParameterBag(properties.jobInput);
        this.jobOutput = new JobParameterBag(properties.jobOutput);

        if (typeof this.tracker === "object") {
            this.tracker = new McmaTracker(this.tracker);
        }

        if (typeof this.notificationEndpoint === "object") {
            this.notificationEndpoint = new NotificationEndpoint(this.notificationEndpoint);
        }
    }
}