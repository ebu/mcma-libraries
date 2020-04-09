import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { McmaObject } from "./mcma-object";

export interface NotificationProperties extends McmaResourceProperties {
    content: McmaObject;
    source?: string;
}

export class Notification extends McmaResource implements NotificationProperties {
    content: McmaObject;
    source?: string;
    constructor(properties) {
        super("Notification", properties);

        this.checkProperty("source", "string", false);
        this.checkProperty("content", "resource", true);
    }
}