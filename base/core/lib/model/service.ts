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

        Utils.checkProperty(this, "name", "string", true);
        Utils.checkProperty(this, "resources", "Array", true);
        Utils.checkProperty(this, "authType", "string", false);
        Utils.checkProperty(this, "jobType", "string", false);
        Utils.checkProperty(this, "jobProfileIds", "Array", false);

        for (let i = 0; i < this.resources.length; i++) {
            this.resources[i] = new ResourceEndpoint(this.resources[i]);
        }
    }
}
