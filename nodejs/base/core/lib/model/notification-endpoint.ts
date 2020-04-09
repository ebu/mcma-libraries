import { McmaResourceProperties, McmaResource } from "./mcma-resource";

export interface NotificationEndpointProperties extends McmaResourceProperties {
    httpEndpoint: string;
}

export class NotificationEndpoint extends McmaResource implements NotificationEndpointProperties {
    httpEndpoint: string;
    constructor(properties: NotificationEndpointProperties) {
        super("NotificationEndpoint", properties);

        this.checkProperty("httpEndpoint", "url", true);
    }
}