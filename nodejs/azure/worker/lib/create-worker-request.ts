import { WorkerRequest, WorkerRequestProperties } from "@mcma/worker";
import { Context } from "@azure/functions";
import { McmaException } from "@mcma/core";

export interface WorkerQueueContext extends Context {
    bindingData: {
        queueTrigger: WorkerRequestProperties; 
    }
}

function getWorkerRequest(context: WorkerQueueContext): WorkerRequest {
    return new WorkerRequest(context.bindingData.queueTrigger);
}

function isWorkerRequest(context: Context): context is WorkerQueueContext {
    return !!context.bindingData?.queueTrigger?.operationName;
}

export function createWorkerRequest(context: Context): WorkerRequest {
    if (!isWorkerRequest(context)) {
        throw new McmaException("Context does not contain a queue message, or the queue message does not contain a worker request.");
    }

    return getWorkerRequest(context);
}