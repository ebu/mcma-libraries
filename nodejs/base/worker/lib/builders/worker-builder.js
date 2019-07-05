const OperationHandlerBuilder = require("./operation-handler-builder");
const Worker = require("../worker");

class WorkerBuilder {
    constructor() {
        const operationHandlerBuilders = [];
        
        this.handleOperation = (operationName, configureOperation) => {
            if (!configureOperation) {
                if (typeof operationName === "function" && operationName.name !== "Function") {
                    const operation = operationName;
                    configureOperation = x => x.handle(operation);
                    operationName = operation.name;
                }
            }
            if (!operationName || typeof operationName !== "string" || operationName.length === 0) {
                throw new Error("operationName must be a non-empty string.");
            }
            if (!configureOperation || typeof configureOperation !== "function") {
                throw new Error("configureOperation must be a function");
            }
            const opHandlerBuilder = new OperationHandlerBuilder(operationName);
            operationHandlerBuilders.push(opHandlerBuilder);
            configureOperation(opHandlerBuilder);
            return this;
        };

        this.build = () => new Worker(operationHandlerBuilders.reduce((flattened, opBuilder) => flattened.concat(opBuilder.build()), []));
    }
}

module.exports = {
    WorkerBuilder
};