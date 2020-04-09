import { McmaTrackerProperties, McmaException } from "@mcma/core";

export type WorkerRequest = {
    operationName: string;
    contextVariables: { [key: string]: string };
    input: any;
    tracker?: McmaTrackerProperties;
}

export type InvokeWorker = (workerFunctionId: string, payload: WorkerRequest) => Promise<void>;

export class WorkerInvoker {
    constructor(private invokeWorker: InvokeWorker) {
        if (!invokeWorker || typeof invokeWorker !== "function") {
            throw new McmaException("invokeWorker must be a function.");
        }
    }
    
    async invoke(
        workerFunctionId: string,
        operationNameOrRequest: string | WorkerRequest,
        contextVariables?: { [key: string]: string },
        input?: any,
        tracker?: McmaTrackerProperties
    ): Promise<void> {
        if (!workerFunctionId || typeof workerFunctionId !== "string") {
            throw new McmaException("Invalid worker function id: " + workerFunctionId);
        }
        let operationName: string;
        if (typeof operationNameOrRequest !== "string") {
            operationName = operationNameOrRequest.operationName;
            contextVariables = operationNameOrRequest.contextVariables;
            input = operationNameOrRequest.input;
            tracker = operationNameOrRequest.tracker;
        } else {
            operationName = operationNameOrRequest;
        }
        if (!operationName) {
            throw new McmaException("Invalid operation name.");
        }

        await this.invokeWorker(workerFunctionId, { operationName, contextVariables, input, tracker });
    };
}