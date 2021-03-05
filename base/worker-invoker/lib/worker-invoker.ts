import { McmaException } from "@mcma/core";
import { WorkerRequestProperties } from "./worker-request-properties";

export abstract class WorkerInvoker {
    protected constructor() {
    }

    async invoke(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
        if (!workerFunctionId || typeof workerFunctionId !== "string") {
            throw new McmaException("Invalid worker function id: " + workerFunctionId);
        }
        await this.invokeWorker(workerFunctionId, workerRequest);
    }

    protected abstract async invokeWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void>;
}
