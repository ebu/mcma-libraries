import { getStatusError } from "./http-statuses";
import { McmaObject, McmaObjectProperties, Utils } from "@mcma/core";

export interface McmaApiErrorProperties extends McmaObjectProperties {
    timestamp?: Date,
    status: number,
    error?: string,
    path: string,
    message?: string,
}

export class McmaApiError extends McmaObject implements McmaApiErrorProperties {
    timestamp: Date;
    status: number;
    error: string;
    path: string;
    message?: string;

    constructor(properties: McmaApiErrorProperties) {
        super("ApiError", properties);

        Utils.checkProperty(this, "status", "number", true);
        Utils.checkProperty(this, "path", "string", true);
        Utils.checkProperty(this, "message", "string", false);

        this.timestamp = Utils.ensureValidDateOrUndefined(this.timestamp);
        if (!this.timestamp) {
            this.timestamp = new Date();
        }
        if (!this.error) {
            this.error = getStatusError(this.status);
        }
    }
}
