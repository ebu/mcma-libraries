import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface NotificationProperties extends McmaObjectProperties {
    source?: string;
    content: any;
}

export class Notification extends McmaObject implements NotificationProperties {
    source?: string;
    content: any;

    constructor(properties: NotificationProperties) {
        super("Notification");
        this.source = properties.source;
        this.content = properties.content;

        Utils.checkProperty(this, "source", "string", false);
        Utils.checkProperty(this, "content", "object", true);
    }
}
