import { McmaObject } from "./mcma-object";

export interface McmaTrackerProperties {
    id: string;
    label: string;
}

export class McmaTracker extends McmaObject implements McmaTrackerProperties {
    id: string;
    label: string;
    
    constructor(properties: McmaTrackerProperties) {
        super("McmaTracker", properties);

        this.checkProperty("id", "string", true);
        this.checkProperty("label", "string", true);
    }
}