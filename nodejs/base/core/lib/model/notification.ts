import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface NotificationProperties extends McmaObjectProperties {
    source?: string;
    content: any;
}

export class Notification extends McmaObject implements NotificationProperties {
    source?: string;
    content: any;

    constructor(properties: NotificationProperties) {
        super("Notification", properties);

        this.checkProperty("source", "string", false);
        this.checkProperty("content", "object", true);
    }
}
