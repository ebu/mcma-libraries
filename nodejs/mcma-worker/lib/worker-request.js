const { ContextVariableProvider } = require('mcma-core');

class WorkerRequest extends ContextVariableProvider {
    constructor(operationName, contextVariables, input) {
        if (!operationName || typeof operationName !== 'string' || operationName.length === 0) {
            throw new Error('operationName must be a non-empty string.');
        }
        if (!input || typeof input !== 'object') {
            throw new Error('input must be an object');
        }
        
        super(contextVariables);

        this.operationName = operationName || '';
        this.input = input || {};

        this.getInput = (inputType) => {
            if (!this.isInputOfType(inputType)) {
                throw new Error('Input is not an instance of type "' + inputType.constructor.name + '"');
            }
            return this.input;
        }

        this.isInputOfType = (inputType) => {
            if (!inputType || typeof inputType !== 'function') {
                throw new Error('inputType must be a function');
            }

            return this.input instanceof inputType;
        }
    }
}

module.exports = {
    WorkerRequest
};