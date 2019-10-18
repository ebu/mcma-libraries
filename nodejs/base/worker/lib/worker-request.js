const { ContextVariableProvider, Exception } = require("@mcma/core");

class WorkerRequest extends ContextVariableProvider {
    constructor(request) {
        const operationName = request && request.operationName;
        const contextVariables = request && request.contextVariables;
        const input = request && request.input;
        const tracker = request && request.tracker;

        if (!operationName || typeof operationName !== "string") {
            throw new Exception("operationName must be a non-empty string.");
        }

        super(contextVariables);

        this.operationName = operationName;
        this.input = input;
        this.tracker = tracker;
    }
}

module.exports = {
    WorkerRequest
};
