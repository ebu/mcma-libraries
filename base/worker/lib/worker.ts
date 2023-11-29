import { McmaException } from "@mcma/core";
import { WorkerRequest } from "./worker-request";
import { ProviderCollection } from "./provider-collection";
import { OperationFilter } from "./operation-filter";
import { OperationHandler } from "./operation-handler";
import { WorkerOperation } from "./worker-operation";

function isWorkerOperation(operation: string | OperationFilter | WorkerOperation): operation is WorkerOperation {
    return operation && typeof (<any>operation)["execute"] !== "undefined";
}

export class Worker {
    private readonly operations: WorkerOperation[];

    constructor(private readonly providers: ProviderCollection) {
        this.operations = [];
    }

    addOperation(operationName: string, handler: OperationHandler): this;
    addOperation(operationFilter: OperationFilter, handler: OperationHandler): this;
    addOperation(operation: WorkerOperation): this;

    addOperation(operation: string | OperationFilter | WorkerOperation, handler?: OperationHandler): this {
        if (!isWorkerOperation(operation)) {
            if (handler) {
                let operationFilter: OperationFilter;
                if (typeof operation === "string") { // case 1. we turn operation into OperationFilter by converting it to a function that checks for operationName equality
                    // capture this now, as the value of operation is going to change to an object below, and the operation name check will fail
                    const operationName = operation;
                    operationFilter = async (_, workerRequest) => workerRequest.operationName === operationName;
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
            if (await op.accepts(this.providers, request, ctx)) {
                operation = op;
                break;
            }
        }

        if (!operation) {
            throw new McmaException("No handler found for operation '" + request.operationName + "' that can handle this request.");
        }

        request.logger?.debug("Handling worker operation '" + request.operationName + "'...");

        try {
            await operation.execute(this.providers, request, ctx);
        } catch (e) {
            request.logger?.error(e?.message);
            request.logger?.error(e?.toString());
            request.logger?.error(e);
            throw new McmaException("Failed to process worker operation '" + request.operationName + "'", e);
        }
    }
}
