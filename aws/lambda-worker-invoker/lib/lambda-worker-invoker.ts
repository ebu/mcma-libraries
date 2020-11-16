import { Lambda } from "aws-sdk";
import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";

export class LambdaWorkerInvoker extends WorkerInvoker {
    constructor(private lambda: Lambda = new Lambda({ apiVersion: "2015-03-31" })) {
        super();
    }

    protected async invokeWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
        await this.lambda.invoke({
            FunctionName: workerFunctionId,
            InvocationType: "Event",
            LogType: "None",
            Payload: JSON.stringify({
                operationName: workerRequest.operationName,
                input: workerRequest.input,
                tracker: workerRequest.tracker,
            })
        }).promise();
    }
}
