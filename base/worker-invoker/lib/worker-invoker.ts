import { McmaException } from "@mcma/core";
import { InvokeWorker } from "./invoke-worker";
import { WorkerRequestProperties } from "./worker-request-properties";

export class WorkerInvoker {
    constructor(private invokeWorker: InvokeWorker) {
        if (!invokeWorker || typeof invokeWorker !== "function") {
            throw new McmaException("invokeWorker must be a function.");
        }
    }

    async invoke(
        workerFunctionId: string,
        workerRequest: WorkerRequestProperties
    ): Promise<void> {
        if (!workerFunctionId || typeof workerFunctionId !== "string") {
            throw new McmaException("Invalid worker function id: " + workerFunctionId);
        }
        await this.invokeWorker(workerFunctionId, workerRequest);
    }
}
