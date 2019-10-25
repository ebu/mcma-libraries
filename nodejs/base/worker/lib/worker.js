const { Exception } = require("@mcma/core");
const { WorkerRequest } = require("./worker-request");
const { ProviderCollection } = require("./provider-collection");

class Worker {
    constructor(providerCollection) {
        if (!providerCollection instanceof ProviderCollection) {
            throw new Exception("Invalid provider collection supplied");
        }

        this.providerCollection = providerCollection;
        this.operations = [];
    }

    /*
        export type OperationFilter = (providers: ProviderCollection, request: WorkerRequest) => Promise<boolean>;
        export type OperationHandler = (providers: ProviderCollection, request: WorkerRequest) => Promise<void>;

        export interface WorkerOperation {
            accepts: OperationFilter;
            execute: OperationHandler;
        }

        addOperation(operationName: string, handler: OperationHandler): Worker;
        addOperation(operationFilter: OperationFilter, handler: OperationHandler): Worker;
        addOperation(operation: WorkerOperation): Worker;
    */

    addOperation(operation, handler) {
        if (handler) {
            if (typeof operation === "string") { // case 1. we turn operation into OperationFilter by converting it to a function that checks for operationName equality
                const operationName = operation;
                operation = async (providers, workerRequest, ctx) => workerRequest.operationName === operationName;
            }

            // build a workerOperation from the operation and handler
            operation = {
                accepts: operation,
                execute: handler,
            };
        }

        if (typeof operation !== "object" || typeof operation.accepts !== "function" || typeof operation.execute !== "function") {
            throw new Exception("Invalid operation supplied");
        }

        this.operations.push(operation);

        return this;
    }

    async doWork(workerRequest, ctx) {
        if (!(workerRequest instanceof WorkerRequest)) {
            throw new Exception("request must be an instance of class WorkerRequest");
        }

        let operation;

        for (const op of this.operations) {
            if (await op.accepts(this.providerCollection, workerRequest, ctx)) {
                operation = op;
                break;
            }
        }

        if (!operation) {
            throw new Exception("No handler found for operation '" + workerRequest.operationName + "' that can handle this request.");
        }

        const logger = this.providerCollection.getLoggerProvider().get(workerRequest.tracker);
        logger.debug("Handling worker operation '" + workerRequest.operationName + "'...");

        try {
            await operation.execute(this.providerCollection, workerRequest, ctx);
        } catch (e) {
            logger.error(e.message);
            logger.error(e);
            throw new Exception("Failed to process worker operation '" + workerRequest.operationName + "'", e);
        }
    }
}

module.exports = {
    Worker
};
