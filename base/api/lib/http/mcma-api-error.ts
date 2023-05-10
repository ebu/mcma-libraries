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
        super("ApiError");

        this.timestamp = Utils.ensureValidDateOrUndefined(properties.timestamp) ?? new Date();
        this.status = properties.status;
        if (!this.error) {
            this.error = getStatusError(properties.status);
        }
        this.path = properties.path;
        this.message = properties.message;

        Utils.checkProperty(this, "status", "number", true);
        Utils.checkProperty(this, "path", "string", true);
        Utils.checkProperty(this, "message", "string", false);
    }
}
