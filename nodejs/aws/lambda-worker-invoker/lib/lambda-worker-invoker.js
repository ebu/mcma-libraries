const util = require("util");
const AWS = require("aws-sdk");
const { WorkerInvoker } = require("@mcma/api");

const Lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });
const LambdaInvoke = util.promisify(Lambda.invoke.bind(Lambda));

async function invokeLambdaWorker(workerFunctionId, workerRequest) {
    await LambdaInvoke({
        FunctionName: workerFunctionId,
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify(workerRequest)
    });
}

class LambdaWorkerInvoker extends WorkerInvoker {
    constructor() {
        super(invokeLambdaWorker);
    }
}

module.exports = {
    invokeLambdaWorker,
    LambdaWorkerInvoker
};