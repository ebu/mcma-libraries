import { McmaTrackerProperties } from "@mcma/core";

export interface WorkerRequestProperties {
    operationName: string;
    contextVariables?: { [key: string]: any };
    input?: { [key: string]: any };
    tracker?: McmaTrackerProperties;
}