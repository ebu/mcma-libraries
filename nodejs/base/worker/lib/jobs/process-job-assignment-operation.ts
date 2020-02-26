import { Exception, Utils, McmaResourceType, Job, getTableName, JobAssignment } from "@mcma/core";
import { ProcessJobAssignmentHelper } from "./process-job-assignment-helper";
import { ProviderCollection } from "../provider-collection";
import { WorkerRequest } from "../worker-request";
import { JobProfileHandler } from "./job-profile-handler";
import { ProcessJobProfile } from "./process-job-profile";

export class ProcessJobAssignmentOperation<T extends Job> {
    private jobType: string;
    private profiles: ProcessJobProfile<T>[] = [];

    constructor(jobType: McmaResourceType<T>) {
        jobType = Utils.getTypeName(jobType);
        if (!jobType) {
            throw new Exception("Worker job helper requires a valid job type to be specified.");
        }
        this.jobType = jobType;
    }

    addProfile(profileName: string, handler: JobProfileHandler<T>): this;
    addProfile(profile: ProcessJobProfile<T>): this;
    addProfile(profile: string | ProcessJobProfile<T>, handler?: JobProfileHandler<T>) {
        if (typeof profile === "string") {
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

    async accepts(providerCollection: ProviderCollection, workerRequest: WorkerRequest, ctx: any): Promise<boolean> {
        return workerRequest.operationName === "ProcessJobAssignment";
    }

    async execute(providerCollection: ProviderCollection, workerRequest: WorkerRequest, ctx: any) {
        if (!workerRequest) {
            throw new Exception("request must be provided");
        }
        if (!workerRequest.input) {
            throw new Exception("request.input is required.");
        }
        if (!workerRequest.input.jobAssignmentId) {
            throw new Exception("request.input does not specify a jobAssignmentId");
        }

        const dbTable = providerCollection.dbTableProvider.get<JobAssignment>(getTableName(workerRequest));
        const logger = providerCollection.loggerProvider.get(workerRequest.tracker);
        const resourceManager = providerCollection.resourceManagerProvider.get(workerRequest);

        const jobAssignmentHelper = new ProcessJobAssignmentHelper<T>(dbTable, resourceManager, logger, workerRequest);

        try {
            logger.info("Initializing job helper...");

            await jobAssignmentHelper.initialize();

            logger.info("Validating job...");

            if (jobAssignmentHelper.job["@type"] !== this.jobType) {
                throw new Exception("Job has type '" + jobAssignmentHelper.job["@type"] + "', which does not match expected job type '" + this.jobType + "'.");
            }

            const matchedProfile = this.profiles.find(p => jobAssignmentHelper.profile.name === p.name);
            if (!matchedProfile) {
                throw new Exception("Job profile '" + jobAssignmentHelper.profile.name + "' is not supported.");
            }

            jobAssignmentHelper.validateJob();

            logger.info("Found handler for job profile '" + jobAssignmentHelper.profile.name + "'");

            await matchedProfile.execute(providerCollection, jobAssignmentHelper, ctx);

            logger.info("Handler for job profile '" + jobAssignmentHelper.profile.name + "' completed")
        } catch (e) {
            logger.error(e.message);
            logger.error(e.toString());
            try {
                await jobAssignmentHelper.fail(e.message);
            } catch (inner) {
                logger.error(inner.toString());
            }
        }
    }
}