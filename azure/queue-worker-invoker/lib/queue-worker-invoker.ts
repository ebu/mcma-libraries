import { DefaultAzureCredential, TokenCredential } from "@azure/identity";
import { StorageSharedKeyCredential, AnonymousCredential, QueueClient } from "@azure/storage-queue";

import { Utils } from "@mcma/core";
import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";

export interface QueueWorkerInvokerConfig {
    credentials?: StorageSharedKeyCredential | AnonymousCredential | TokenCredential
}

export class QueueWorkerInvoker extends WorkerInvoker {
    constructor(private readonly config?: QueueWorkerInvokerConfig) {
        super();

        if (!this.config) {
            this.config = {};
        }
        if (!this.config.credentials) {
            if (!this.config.credentials) {
                this.config.credentials = new DefaultAzureCredential();
            }
        }
    }

    protected async invokeWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
        const queueClient = new QueueClient(workerFunctionId, this.config.credentials);
        await queueClient.sendMessage(Utils.toBase64(JSON.stringify(workerRequest)));
    }
}
