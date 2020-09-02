import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface McmaTrackerProperties extends McmaObjectProperties {
    id: string;
    label: string;
    custom?: { [key: string]: string };
}

export class McmaTracker extends McmaObject implements McmaTrackerProperties {
    id: string;
    label: string;
    custom?: { [key: string]: string };

    constructor(properties: McmaTrackerProperties) {
        super("McmaTracker", properties);

        this.checkProperty("id", "string", true);
        this.checkProperty("label", "string", true);
        this.checkProperty("custom", "object", false);
    }
}
