import { McmaTrackerProperties } from "@mcma/core";

export interface WorkerRequestProperties {
    operationName: string;
    input?: { [key: string]: any };
    tracker?: McmaTrackerProperties;
}
