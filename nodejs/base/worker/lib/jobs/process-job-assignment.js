const { Logger } = require("@mcma/core");
const { WorkerJobHelper } = require("./worker-job-helper");

class ProcessJobAssignment {
    constructor(jobType, dbTableProvider, resourceManagerProvider) {
        if (typeof resourceManagerProvider !== "object" || !resourceManagerProvider.get) {
            throw new Error("Invalid resourceManagerProvider");
        }
        this.profileHandlers = {};

        this.execute = async (request) => {
            if (!request) {
                throw new Error("request must be provided");
            }
            if (!request.input) {
                throw new Error("request.input is required.");
            }
            if (!request.input.jobAssignmentId) {
                throw new Error("request.input does not specify a jobAssignmentId");
            }

            const workerJobHelper = new WorkerJobHelper(jobType, dbTableProvider.table(request.tableName()), resourceManagerProvider.get(request), request, request.input.jobAssignmentId);

            try {
                Logger.debug("Initializing job helper...");

                await workerJobHelper.initialize();

                Logger.debug("Validating job...");

                workerJobHelper.validateJob(Object.keys(this.profileHandlers));

                Logger.debug("Getting handler for profile '" + workerJobHelper.getProfile().name + "'...");

                const profileHandler = this.profileHandlers[workerJobHelper.getMatchedProfileName()];

                Logger.debug("Found handler for profile '" + workerJobHelper.getProfile().name + "'");

                await profileHandler(workerJobHelper);
            } catch (e) {
                Logger.exception(e);
                try {
                    await workerJobHelper.fail(e);
                } catch (inner) {
                    Logger.exception(inner);
                }
            }
        };
    }
}

module.exports = {
    ProcessJobAssignment
};