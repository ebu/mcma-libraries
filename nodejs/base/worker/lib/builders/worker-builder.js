const { OperationHandlerBuilder } = require("./operation-handler-builder");
const { Worker } = require("../worker");

class WorkerBuilder {
    constructor() {
        const operationHandlerBuilders = {};

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
            if (Object.keys(operationHandlerBuilders).find(k => k.toLowerCase() === operationName.toLowerCase())) {
                throw new Error("Operation with name '" + operationName + "' is already being handled.");
            }
            const opHandlerBuilder = new OperationHandlerBuilder(operationName);
            operationHandlerBuilders[operationName] = opHandlerBuilder;
            configureOperation(opHandlerBuilder);
            return this;
        };

        this.build = () => new Worker(Object.values(operationHandlerBuilders).reduce((flattened, opBuilder) => flattened.concat(opBuilder.build()), []));
    }
}

module.exports = {
    WorkerBuilder
};
