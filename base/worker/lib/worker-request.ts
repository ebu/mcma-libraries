import { Logger, McmaException, McmaTrackerProperties,  } from "@mcma/core";
import { WorkerRequestProperties } from "./worker-request-properties";

export class WorkerRequest implements WorkerRequestProperties {
    operationName: string;
    input?: { [key: string]: any };
    tracker?: McmaTrackerProperties;
    logger?: Logger;

    constructor(request: WorkerRequestProperties, logger?: Logger) {
        const operationName = request?.operationName;
        if (!operationName || typeof operationName !== "string") {
            throw new McmaException("operationName must be a non-empty string.");
        }

        this.operationName = operationName;
        this.input = request.input;
        this.tracker = request.tracker;
        this.logger = logger;
    }
}
