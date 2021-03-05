import { getStatusError } from "./http-statuses";
import { McmaObject, McmaObjectProperties } from "@mcma/core";

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

        this.checkProperty("status", "number", true);
        this.checkProperty("path", "string", true);
        this.checkProperty("message", "string", false);

        this.timestamp = this.ensureValidDateOrUndefined(this.timestamp);
        if (!this.timestamp) {
            this.timestamp = new Date();
        }
        if (!this.error) {
            this.error = getStatusError(this.status);
        }
    }
}
