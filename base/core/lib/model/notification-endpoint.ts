import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface NotificationEndpointProperties extends McmaObjectProperties {
    httpEndpoint: string;
}

export class NotificationEndpoint extends McmaObject implements NotificationEndpointProperties {
    httpEndpoint: string;

    constructor(properties: NotificationEndpointProperties) {
        super("NotificationEndpoint");
        this.httpEndpoint = properties.httpEndpoint;

        Utils.checkProperty(this, "httpEndpoint", "url", true);
    }
}
