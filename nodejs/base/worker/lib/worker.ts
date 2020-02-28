import { McmaException, McmaResource } from "@mcma/core";
import { WorkerRequest, WorkerRequestProperties } from "./worker-request";
import { ProviderCollection } from "./provider-collection";
import { OperationFilter } from "./operation-filter";
import { OperationHandler } from "./operation-handler";
import { WorkerOperation } from "./worker-operation";

export class Worker {
    private operations: WorkerOperation[];

    constructor(private providerCollection: ProviderCollection) {
        this.providerCollection = providerCollection;
        this.operations = [];
    }

    private isWorkerOperation(operation: string | OperationFilter | WorkerOperation): operation is WorkerOperation {
        return operation && typeof operation["execute"] !== "undefined";
    }

    addOperation(operationName: string, handler: OperationHandler): this;
    addOperation(operationFilter: OperationFilter, handler: OperationHandler): this;
    addOperation(operation: WorkerOperation): this;

    addOperation(operation: string | OperationFilter | WorkerOperation, handler?: OperationHandler): this {
        if (!this.isWorkerOperation(operation)) {
            if (handler) {
                let operationFilter: OperationFilter;
                if (typeof operation === "string") { // case 1. we turn operation into OperationFilter by converting it to a function that checks for operationName equality
                    operationFilter = async (_, workerRequest) => workerRequest.operationName === operation;
                } else if (operation ) {
                    operationFilter = operation;
                }
                // build a workerOperation from the operation and handler
                operation = {
                    accepts: operationFilter,
                    execute: handler,
                };
            } else {
                throw new McmaException("addOperation must specify a handler argument if the provided object is not a WorkerOperation.");
            }
        }

        if (typeof operation !== "object" || typeof operation.accepts !== "function" || typeof operation.execute !== "function") {
            throw new McmaException("Invalid operation supplied");
        }

        this.operations.push(operation);

        return this;
    }

    async doWork(request: WorkerRequest, ctx?: any): Promise<void> {
        if (!(request instanceof WorkerRequest)) {
            throw new McmaException("request must be an instance of class WorkerRequest");
        }

        let operation: WorkerOperation;

        for (const op of this.operations) {
            if (await op.accepts(this.providerCollection, request, ctx)) {
                operation = op;
                break;
            }
        }

        if (!operation) {
            throw new McmaException("No handler found for operation '" + request.operationName + "' that can handle this request.");
        }

        const logger = this.providerCollection.loggerProvider.get(request.tracker);
        logger.debug("Handling worker operation '" + request.operationName + "'...");

        try {
            await operation.execute(this.providerCollection, request, ctx);
        } catch (e) {
            logger.error(e.message);
            logger.error(e.toString());
            throw new McmaException("Failed to process worker operation '" + request.operationName + "'", e);
        }
    }
}