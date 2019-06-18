const { Logger } = require("mcma-core");
const WorkerRequest = require("./worker-request");

class Worker {
    constructor(operationFilters) {

        this.doWork = async (request) => {
            if (!(request instanceof WorkerRequest)) {
                throw new Error("request must be an instance of class WorkerRequest");
            }

            const operationFilter = operationFilters.find(oh => oh.filter(request));
            if (!operationFilter) {
                throw new Error(`No handler found for ${request.operationName} that can handle this request.`);
            }

            Logger.debug("Handling worker operation '" + request.operationName + "'...");

            try {
                await operationFilter.handler(request);
            } catch (e) {
                Logger.error(`Failed to process worker operation "${request.operationName}"`);
                Logger.exception(e);

                throw e;
            }
        };
    }
}

module.exports = Worker;