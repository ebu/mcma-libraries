const { ContextVariableProvider } = require("mcma-core");

class WorkerRequest extends ContextVariableProvider {
    constructor(request) {
        const operationName = request && request.operationName;
        const contextVariables = request && request.contextVariables;
        const input = request && request.input;

        if (!operationName || typeof operationName !== "string" || operationName.length === 0) {
            throw new Error("operationName must be a non-empty string.");
        }
        
        super(contextVariables);

        this.operationName = operationName;
        this.input = input;
    }
}

module.exports = {
    WorkerRequest
};