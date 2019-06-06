const OperationHandlerBuilder = require('./operation-handler-builder');
const Worker = require('../worker');

class WorkerBuilder {
    constructor() {
        const operationHandlerBuilders = [];
        
        this.handleOperation = (requestType, operationName, configureOperation) => {
            if (!operationName || typeof operationName !== 'string' || operationName.length === '') {
                throw new Error('operationName must be a non-empty string.');
            }
            if (!configureOperation || typeof configureOperation !== 'function') {
                throw new Error('configureOperation must be a function');
            }
            const opHandlerBuilder = new OperationHandlerBuilder(requestType, operationName);
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