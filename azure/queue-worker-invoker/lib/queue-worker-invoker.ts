import { QueueServiceClient } from "@azure/storage-queue";

import { Utils } from "@mcma/core";
import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";

const appStorageConnectionString = process.env.WEBSITE_CONTENTAZUREFILECONNECTIONSTRING;

export async function invokeQueueTriggeredWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
    const queueStorageClient = QueueServiceClient.fromConnectionString(appStorageConnectionString);
    const queueClient = queueStorageClient.getQueueClient(workerFunctionId);
    await queueClient.sendMessage(Utils.toBase64(JSON.stringify(workerRequest)));
}

export class QueueWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokeQueueTriggeredWorker);
    }
}
