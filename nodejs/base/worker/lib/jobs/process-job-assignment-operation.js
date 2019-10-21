const { Exception, Utils } = require("@mcma/core");
const { ProcessJobAssignmentHelper } = require("./process-job-assignment-helper");

class ProcessJobAssignmentOperation {
    constructor(jobType) {
        jobType = Utils.getTypeName(jobType);
        if (!jobType) {
            throw new Exception("Worker job helper requires a valid job type to be specified.");
        }
        this.jobType = jobType;
        this.profiles = [];
    }

    /*
        export type JobProfileHandler<T extends Job> = (workerJobHelper: WorkerJobHelper<T>) => Promise<void>

        export interface ProcessJobProfile<T extends Job> {
            name: string;
            execute: JobProfileHandler<T>;
        }

        addProfile(profileName: string, handler: ProcessJobProfileHandler<T>): ProcessJobAssignmentOperation<T>
        addProfile(profile: ProcessJobProfile<T>): ProcessJobAssignmentOperation<T>
    */

    addProfile(profile, handler) {
        if (handler) {
            profile = {
                name: profile,
                execute: handler,
            };
        }

        if (typeof profile !== "object" || typeof profile.name !== "string" || typeof profile.execute !== "function") {
            throw new Exception("Invalid profile supplied");
        }

        this.profiles.push(profile);

        return this;
    }

    async accepts(providerCollection, workerRequest) {
        return workerRequest.operationName === "ProcessJobAssignment";
    }

    async execute(providerCollection, workerRequest) {
        if (!workerRequest) {
            throw new Exception("request must be provided");
        }
        if (!workerRequest.input) {
            throw new Exception("request.input is required.");
        }
        if (!workerRequest.input.jobAssignmentId) {
            throw new Exception("request.input does not specify a jobAssignmentId");
        }

        const logger = providerCollection.loggerProvider.get(workerRequest.tracker);
        const dbTable = providerCollection.dbTableProvider.get(workerRequest.tableName());
        const resourceManager = providerCollection.resourceManagerProvider.get(workerRequest);

        const processJobAssignmentHelper = new ProcessJobAssignmentHelper(dbTable, resourceManager, logger, workerRequest);

        try {
            logger.debug("Initializing job helper...");

            await processJobAssignmentHelper.initialize();

            logger.debug("Validating job...");

            if (processJobAssignmentHelper.getJob()["@type"] !== this.jobType) {
                const errorMessage = "Job has type '" + processJobAssignmentHelper.getJob()["@type"] + "', which does not match expected job type '" + this.jobType + "'.";
                logger.error(errorMessage);
                return await processJobAssignmentHelper.fail(errorMessage);
            }

            const matchedProfile = this.profiles.find(p => processJobAssignmentHelper.getProfile().name === p.name);
            if (!matchedProfile) {
                const errorMessage = "Job profile '" + processJobAssignmentHelper.getProfile().name + "' is not supported.";
                logger.error(errorMessage);
                return await processJobAssignmentHelper.fail(errorMessage);
            }

            processJobAssignmentHelper.validateJob();

            logger.debug("Found handler for job profile '" + processJobAssignmentHelper.getProfile().name + "'");

            await matchedProfile.execute(processJobAssignmentHelper);

            logger.debug("Handler for job profile '" + processJobAssignmentHelper.getProfile().name + "' completed")
        } catch (e) {
            logger.error(e.message);
            logger.error(e);
            try {
                await processJobAssignmentHelper.fail(e.message);
            } catch (inner) {
                logger.error(inner);
            }
        }
    }
}

module.exports = {
    ProcessJobAssignmentOperation
};
