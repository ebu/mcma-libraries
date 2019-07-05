const util = require("util");
const AWS = require("aws-sdk");
const Lambda = new AWS.Lambda({ apiVersion: "2015-03-31" });
const LambdaInvoke = util.promisify(Lambda.invoke.bind(Lambda));

async function invokeLambdaWorker(workerFunctionName, payload) {
    await LambdaInvoke({
        FunctionName: workerFunctionName,
        InvocationType: "Event",
        LogType: "None",
        Payload: JSON.stringify(payload)
    });
}

module.exports = {
    invokeLambdaWorker
};