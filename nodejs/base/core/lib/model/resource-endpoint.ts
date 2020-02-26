import { McmaObject } from "./mcma-object";

export interface ResourceEndpointProperties {
    resourceType: string;
    httpEndpoint: string;
    authType: string;
    authContext?: any;
}

export class ResourceEndpoint extends McmaObject implements ResourceEndpointProperties {
    resourceType: string;
    httpEndpoint: string;
    authType: string;
    authContext?: any;
    
    constructor(properties: ResourceEndpointProperties) {
        super("ResourceEndpoint", properties);

        this.checkProperty("resourceType", "string", true);
        this.checkProperty("httpEndpoint", "url", true);
        this.checkProperty("authType", "string", false);
    }
}