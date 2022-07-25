import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

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

        Utils.checkProperty(this, "id", "string", true);
        Utils.checkProperty(this, "label", "string", true);
        Utils.checkProperty(this, "custom", "object", false);
    }
}
