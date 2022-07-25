import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface ResourceEndpointProperties extends McmaObjectProperties {
    resourceType: string;
    httpEndpoint: string;
    authType?: string;
}

export class ResourceEndpoint extends McmaObject implements ResourceEndpointProperties {
    resourceType: string;
    httpEndpoint: string;
    authType?: string;

    constructor(properties: ResourceEndpointProperties) {
        super("ResourceEndpoint", properties);

        Utils.checkProperty(this, "resourceType", "string", true);
        Utils.checkProperty(this, "httpEndpoint", "url", true);
        Utils.checkProperty(this, "authType", "string", false);
    }
}
