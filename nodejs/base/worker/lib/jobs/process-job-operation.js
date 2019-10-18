const { Exception } = require("@mcma/core");
const { ProcessJobHelper } = require("./process-job-helper");

class ProcessJobOperation {
    constructor(jobType) {
        this.jobType = jobType;
        this.profiles = [];
    }

    /*
        export type JobProfileHandler<T extends Job> = (workerJobHelper: WorkerJobHelper<T>) => Promise<void>

        export interface ProcessJobProfile<T extends Job> {
            name: string;
            execute: JobProfileHandler<T>;
        }

        addProfile(profileName: string, handler: ProcessJobProfileHandler<T>): ProcessJobOperation<T>
        addProfile(profile: ProcessJobProfile<T>): ProcessJobOperation<T>
    */

    addProfile(profile, handler) {
        if (handler) {
            profile = {
                name: profile,
                handler: handler,
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

        const processJobHelper = new ProcessJobHelper(dbTable, resourceManager, logger, workerRequest);

        try {
            logger.debug("Initializing job helper...");

            await processJobHelper.initialize();

            logger.debug("Validating job...");

            if (processJobHelper.getJob()["@type"] !== this.jobType) {
                return await processJobHelper.fail("Job has type '" + processJobHelper.getJob()["@type"] + "', which does not match expected job type '" + this.jobType + "'.");
            }

            const matchedProfile = this.profiles.find(p => processJobHelper.getProfile().name === p.name);
            if (!matchedProfile) {
                return await processJobHelper.fail("Job profile '" + processJobHelper.getProfile().name + "' is not supported.");
            }

            processJobHelper.validateJob();

            logger.debug("Found handler for job profile '" + processJobHelper.getProfile().name + "'");

            await matchedProfile.execute(processJobHelper);
        } catch (e) {
            logger.error(e);
            try {
                await processJobHelper.fail(e.message);
            } catch (inner) {
                logger.error(inner);
            }
        }
    }
}

module.exports = {
    ProcessJobOperation
};
