import { Lambda } from "aws-sdk";
import { WorkerInvoker, WorkerRequestProperties } from "@mcma/worker-invoker";

const lambdaClient = new Lambda({ apiVersion: "2015-03-31" });

export async function invokeLambdaWorker(workerFunctionId: string, workerRequest: WorkerRequestProperties): Promise<void> {
    await lambdaClient.invoke({
        FunctionName: workerFunctionId,
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify({
            operationName: workerRequest.operationName,
            contextVariables: workerRequest.contextVariables,
            input: workerRequest.input,
            tracker: workerRequest.tracker,
        })
    }).promise();
}

export class LambdaWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokeLambdaWorker);
    }
}
