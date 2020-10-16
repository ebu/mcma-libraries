import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";
import { PubSub } from "@google-cloud/pubsub"

const pubsub = new PubSub();

export async function invokePubSubTriggeredWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
    const topic = pubsub.topic(workerFunctionId);

    const body = Buffer.from(JSON.stringify({
        operationName: workerRequest.operationName,
        contextVariables: workerRequest.contextVariables,
        input: workerRequest.input,
        tracker: workerRequest.tracker,
    }), "utf8");

    await topic.publish(body);
}

export class PubSubTriggeredWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokePubSubTriggeredWorker);
    }
}
