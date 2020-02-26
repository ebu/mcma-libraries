import { OperationFilter } from "./operation-filter";
import { OperationHandler } from "./operation-handler";
export interface WorkerOperation {
    accepts: OperationFilter;
    execute: OperationHandler;
}
