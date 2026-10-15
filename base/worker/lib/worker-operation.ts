import { OperationFilter } from "./operation-filter.js";
import { OperationHandler } from "./operation-handler.js";

export interface WorkerOperation {
    accepts: OperationFilter;
    execute: OperationHandler;
}
