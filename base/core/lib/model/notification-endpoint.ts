import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface NotificationEndpointProperties extends McmaObjectProperties {
    httpEndpoint: string;
}

export class NotificationEndpoint extends McmaObject implements NotificationEndpointProperties {
    httpEndpoint: string;
    constructor(properties: NotificationEndpointProperties) {
        super("NotificationEndpoint", properties);

        this.checkProperty("httpEndpoint", "url", true);
    }
}
