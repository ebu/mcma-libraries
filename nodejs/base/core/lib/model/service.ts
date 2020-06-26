import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { ResourceEndpoint, ResourceEndpointProperties } from "./resource-endpoint";

export interface ServiceProperties extends McmaResourceProperties {
    name: string;
    resources: ResourceEndpointProperties[];
    authType?: string;
    authContext?: any;
    jobType?: string;
    jobProfiles?: string[];
}

export class Service extends McmaResource implements ServiceProperties {
    name: string;
    resources: ResourceEndpointProperties[];
    authType?: string;
    authContext?: any;
    jobType?: string;
    jobProfiles?: string[];

    constructor(properties: ServiceProperties) {
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
    }
}
