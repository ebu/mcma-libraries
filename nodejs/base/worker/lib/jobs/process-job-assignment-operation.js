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

    async accepts(providerCollection, workerRequest, ctx) {
        return workerRequest.operationName === "ProcessJobAssignment";
    }

    async execute(providerCollection, workerRequest, ctx) {
        if (!workerRequest) {
            throw new Exception("request must be provided");
        }
        if (!workerRequest.input) {
            throw new Exception("request.input is required.");
        }
        if (!workerRequest.input.jobAssignmentId) {
            throw new Exception("request.input does not specify a jobAssignmentId");
        }

        const dbTable = providerCollection.getDbTableProvider().get(workerRequest.tableName());
        const logger = providerCollection.getLoggerProvider().get(workerRequest.tracker);
        const resourceManager = providerCollection.getResourceManagerProvider().get(workerRequest);

        const jobAssignmentHelper = new ProcessJobAssignmentHelper(dbTable, resourceManager, logger, workerRequest);

        try {
            logger.info("Initializing job helper...");

            await jobAssignmentHelper.initialize();

            logger.info("Validating job...");

            if (jobAssignmentHelper.getJob()["@type"] !== this.jobType) {
                throw new Exception("Job has type '" + jobAssignmentHelper.getJob()["@type"] + "', which does not match expected job type '" + this.jobType + "'.");
            }

            const matchedProfile = this.profiles.find(p => jobAssignmentHelper.getProfile().name === p.name);
            if (!matchedProfile) {
                throw new Exception("Job profile '" + jobAssignmentHelper.getProfile().name + "' is not supported.");
            }

            jobAssignmentHelper.validateJob();

            logger.info("Found handler for job profile '" + jobAssignmentHelper.getProfile().name + "'");

            await matchedProfile.execute(providerCollection, jobAssignmentHelper, ctx);

            logger.info("Handler for job profile '" + jobAssignmentHelper.getProfile().name + "' completed")
        } catch (e) {
            logger.error(e.message);
            logger.error(e);
            try {
                await jobAssignmentHelper.fail(e.message);
            } catch (inner) {
                logger.error(inner);
            }
        }
    }
}

module.exports = {
    ProcessJobAssignmentOperation
};
