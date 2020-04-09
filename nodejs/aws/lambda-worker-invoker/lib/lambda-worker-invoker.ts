import { Lambda } from "aws-sdk";
import { InvokeWorker, WorkerInvoker, WorkerRequest } from "@mcma/api";

const lambdaClient = new Lambda({ apiVersion: "2015-03-31" });

export const invokeLambdaWorker: InvokeWorker = async (workerFunctionId: string, workerRequest: WorkerRequest): Promise<void> => {
    await lambdaClient.invoke({
        FunctionName: workerFunctionId,
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify(workerRequest)
    }).promise();
};

export class LambdaWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokeLambdaWorker);
    }
}
