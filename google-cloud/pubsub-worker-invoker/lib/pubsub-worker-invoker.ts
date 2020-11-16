import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";
import { PubSub } from "@google-cloud/pubsub"

export class PubSubTriggeredWorkerInvoker extends WorkerInvoker {
    constructor(private pubsub: PubSub = new PubSub()) {
        super();
    }

    protected async invokeWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
        const topic = this.pubsub.topic(workerFunctionId);

        const body = Buffer.from(JSON.stringify({
            operationName: workerRequest.operationName,
            input: workerRequest.input,
            tracker: workerRequest.tracker,
        }), "utf8");

        await topic.publish(body);
    }
}
