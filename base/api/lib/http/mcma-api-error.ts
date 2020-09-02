import { getStatusError } from "./http-statuses";
import { McmaObject } from "@mcma/core";

export class McmaApiError extends McmaObject {
    timestamp: Date;
    error: string;

    constructor(public status: number, public message: string, public path: string) {
        super("ApiError", {});
        this.timestamp = new Date();
        this.error = getStatusError(this.status);
    }
}
