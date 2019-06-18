const { ContextVariableProvider } = require("mcma-core");

class WorkerRequest extends ContextVariableProvider {
    constructor(operationName, contextVariables, input) {
        if (!operationName || typeof operationName !== "string" || operationName.length === 0) {
            throw new Error("operationName must be a non-empty string.");
        }
        if (!input || typeof input !== "object") {
            throw new Error("input must be an object");
        }
        
        super(contextVariables);

        this.operationName = operationName || "";
        this.input = input || {};
    }
}

module.exports = {
    WorkerRequest
};