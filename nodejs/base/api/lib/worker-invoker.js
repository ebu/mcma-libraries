class WorkerInvoker {
    constructor(invokeWorker) {
        if (!invokeWorker || typeof invokeWorker !== "function") {
            throw new Error("invokeWorker must be a function.");
        }
        this.invoke = async (workerFunctionId, operationName, contextVariables, input, tracker) => {
            if (!workerFunctionId || typeof workerFunctionId !== "string") {
                throw new Error("Invalid worker function id: " + workerFunctionId);
            }
            if (typeof operationName === "object") {
                operationName = operationName.operationName;
                contextVariables = operationName.contextVariables;
                input = operationName.input;
                tracker = operationName.tracker;
            }
            if (!operationName) {
                throw new Error("Invalid operation name.");
            }

            await invokeWorker(workerFunctionId, { operationName, contextVariables, input, tracker });
        };
    }
}

module.exports = {
    WorkerInvoker
};
