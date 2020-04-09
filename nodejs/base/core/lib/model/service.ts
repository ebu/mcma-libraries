import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { ResourceEndpoint, ResourceEndpointProperties } from "./resource-endpoint";
import { JobProfile, JobProfileProperties } from "./job-profile";

export interface ServiceProperties extends McmaResourceProperties {
    name: string;
    resources: ResourceEndpointProperties[];
    authType: string;
    jobType: string;
    jobProfiles: (string | JobProfileProperties)[];
    authContext?: any;
}

export class Service extends McmaResource implements ServiceProperties {
    name: string;
    resources: ResourceEndpointProperties[];
    authType: string;
    jobType: string;
    jobProfiles: (string | JobProfileProperties)[];
    authContext: any;

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
                const jobProfile = this.jobProfiles[i];
                if (typeof jobProfile !== "string") {
                    this.jobProfiles[i] = new JobProfile(jobProfile);
                }
            }
        }
    }
}