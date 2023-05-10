import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { ResourceEndpoint, ResourceEndpointProperties } from "./resource-endpoint";
import { Utils } from "../utils";

export interface ServiceProperties extends McmaResourceProperties {
    name: string;
    resources: ResourceEndpointProperties[];
    authType?: string;
    jobType?: string;
    jobProfileIds?: string[];
}

export class Service extends McmaResource implements ServiceProperties {
    name: string;
    resources: ResourceEndpoint[];
    authType?: string;
    jobType?: string;
    jobProfileIds?: string[];

    constructor(properties: ServiceProperties) {
        super("Service", properties);
        this.name = properties.name;
        this.resources = properties.resources?.map(re => new ResourceEndpoint(re));
        this.authType = properties.authType;
        this.jobType = properties.jobType;
        if (Array.isArray(properties.jobProfileIds)) {
            this.jobProfileIds = [...properties.jobProfileIds];
        }

        Utils.checkProperty(this, "name", "string", true);
        Utils.checkProperty(this, "resources", "Array", true);
        Utils.checkProperty(this, "authType", "string", false);
        Utils.checkProperty(this, "jobType", "string", false);
        Utils.checkProperty(this, "jobProfileIds", "Array", false);
    }
}
