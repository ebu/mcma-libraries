import { getStatusError } from "./http-statuses";
export class McmaApiError {
    timestamp: Date;
    error: string;
    constructor(public status: number, public message: string, public path: string) {
        this["@type"] = "ApiError";
        this.timestamp = new Date();
        this.error = getStatusError(this.status);
    }
}
