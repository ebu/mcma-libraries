const WorkerRequest = require('../worker-request');

class OperationHandlerBuilder {
    constructor(requestType, operationName) {
        if (!requestType || typeof requestType !== 'function' || !requestType.prototype) {
            throw new Error('Invalid request type specified for handler.');
        }
        if (!operationName || typeof operationName !== 'string' || operationName.length === 0) {
            throw new Error('Invalid operation name specified for handler.');
        }

        const filters = {};

        this.handle = (handler, filter) => {
            if (!handler) {
                throw new Error('Must specify a handler.');
            }
            if (filter && typeof filter !== 'function') {
                throw new Error('Invalid filter provided for handler. Filter must be a function.');
            }

            if (typeof handler === 'function') {
                if (handler.prototype) {
                    const handlerObj = new handler();
                    if (!handlerObj.execute) {
                        throw new Error('Invalid handler provided. Handler must be a function or an object that defines a function called "execute"');
                    }
                    handler = handlerObj.execute;
                }
            } else if (typeof handler === 'object' && handler.execute) {
                handler = handler.execute;
            } else {
                throw new Error('Invalid handler provided. Handler must be a function or an object that defines a function called "execute"');
            }

            const filteredOpBuilder = {
                build: () => {
                    return {
                        handler,
                        filter: request =>
                            request.isInputOfType(requestType) &&
                            request.operationName &&
                            operationName.toLowerCase() === request.operationName.toLowerCase() &&
                            (!filter || filter(request))
                    };
                }
            };

            filters[filter ? filter.toString() : ''] = filteredOpBuilder;
            return this;
        };

        this.build = () => Object.keys(filters).map(k => filters[k].build());
    }
}

module.exports = OperationHandlerBuilder;