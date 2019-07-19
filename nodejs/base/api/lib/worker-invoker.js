class WorkerInvoker {
    constructor(invokeWorker) {
        if (!invokeWorker || typeof invokeWorker !== "function") {
            throw new Error("invokeWorker must be a function.");
        }
        this.invoke = async (workerFunctionId, operationName, contextVariables, input) => {
            if (!workerFunctionId || typeof workerFunctionId !== "string") {
                throw new Error("Invalid worker function id.", workerFunctionId);
            }
            if (typeof operationName === "object") {
                operationName = operationName.operationName;
                contextVariables = operationName.contextVariables;
                input = operationName.input;
            }
            if (!operationName) {
                throw new Error("Invalid operation name.");
            }

            await invokeWorker(workerFunctionId, { operationName, contextVariables, input });
        };
    }
}

module.exports = {
    WorkerInvoker
};