import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";

export class LambdaWorkerInvoker extends WorkerInvoker {
    constructor(private lambdaClient: LambdaClient = new LambdaClient({ apiVersion: "2015-03-31" })) {
        super();
    }

    protected async invokeWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
        await this.lambdaClient.send(new InvokeCommand({
            FunctionName: workerFunctionId,
            InvocationType: "Event",
            LogType: "None",
            Payload: new TextEncoder().encode(JSON.stringify({
                operationName: workerRequest.operationName,
                input: workerRequest.input,
                tracker: workerRequest.tracker,
            }))
        }));
    }
}
