import { WorkerInvoker, WorkerRequestProperties } from "@mcma/api";
import { QueueServiceClient } from "@azure/storage-queue";

const appStorageConnectionString = process.env.WEBSITE_CONTENTAZUREFILECONNECTIONSTRING;

export async function invokeQueueTriggeredWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
    const queueStorageClient = QueueServiceClient.fromConnectionString(appStorageConnectionString);
    const queueClient = queueStorageClient.getQueueClient(workerFunctionId);
    await queueClient.sendMessage(JSON.stringify(workerRequest));
}

export class QueueWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokeQueueTriggeredWorker);
    }
}