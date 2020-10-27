import { ConfigVariables, Job, JobStatus, McmaException, McmaResourceType, ProblemDetail, Utils } from "@mcma/core";
import { getTableName } from "@mcma/data";
import { ProcessJobAssignmentHelper } from "./process-job-assignment-helper";
import { ProviderCollection } from "../provider-collection";
import { WorkerRequest } from "../worker-request";
import { JobProfileHandler } from "./job-profile-handler";
import { ProcessJobProfile } from "./process-job-profile";

export class ProcessJobAssignmentOperation<T extends Job> {
    private readonly jobType: string;
    private profiles: ProcessJobProfile<T>[] = [];

    constructor(jobType: McmaResourceType<T>, private readonly initialJobStatus: JobStatus = JobStatus.Running, private configVariables = ConfigVariables.getInstance()) {
        jobType = Utils.getTypeName(jobType);
        if (!jobType) {
            throw new McmaException("Worker job helper requires a valid job type to be specified.");
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
            throw new McmaException("Invalid profile supplied");
        }

        this.profiles.push(profile);

        return this;
    }

    async accepts(providers: ProviderCollection, workerRequest: WorkerRequest): Promise<boolean> {
        return workerRequest.operationName === "ProcessJobAssignment";
    }

    async execute(providers: ProviderCollection, workerRequest: WorkerRequest, ctx?: any) {
        if (!workerRequest) {
            throw new McmaException("request must be provided");
        }
        if (!workerRequest.input) {
            throw new McmaException("request.input is required.");
        }
        if (!workerRequest.input.jobAssignmentDatabaseId) {
            throw new McmaException("request.input does not specify a jobAssignmentDatabaseId");
        }

        const dbTable = await providers.dbTableProvider.get(getTableName(this.configVariables));
        const resourceManager = providers.resourceManagerProvider.get(this.configVariables);

        const jobAssignmentHelper = new ProcessJobAssignmentHelper<T>(dbTable, resourceManager, workerRequest);

        try {
            workerRequest.logger?.info("Initializing job helper...");

            await jobAssignmentHelper.initialize(this.initialJobStatus);

            workerRequest.logger?.info("Validating job...");

            if (jobAssignmentHelper.job["@type"] !== this.jobType) {
                return await this.failJobWithMessage(jobAssignmentHelper, workerRequest, "Job has type '" + jobAssignmentHelper.job["@type"] + "', which does not match expected job type '" + this.jobType + "'.");
            }

            const matchedProfile = this.profiles.find(p => jobAssignmentHelper.profile.name === p.name);
            if (!matchedProfile) {
                return await this.failJobWithMessage(jobAssignmentHelper, workerRequest, "Job profile '" + jobAssignmentHelper.profile.name + "' is not supported.");
            }

            jobAssignmentHelper.validateJob();

            workerRequest.logger?.info("Found handler for job profile '" + jobAssignmentHelper.profile.name + "'");

            await matchedProfile.execute(providers, jobAssignmentHelper, ctx);

            workerRequest.logger?.info("Handler for job profile '" + jobAssignmentHelper.profile.name + "' completed");
        } catch (e) {
            await this.failJobOnException(jobAssignmentHelper, workerRequest, e);
        }
    }

    private async failJobOnException(jobAssignmentHelper: ProcessJobAssignmentHelper<T>, workerRequest: WorkerRequest, error: any) {
        workerRequest.logger?.error(error.toString());
        await this.failJobWithMessage(jobAssignmentHelper, workerRequest, error.message);
    }

    private async failJobWithMessage(jobAssignmentHelper: ProcessJobAssignmentHelper<T>, workerRequest: WorkerRequest, message: string) {
        workerRequest.logger?.error(message);
        try {
            await jobAssignmentHelper.fail(new ProblemDetail({
                type: "uri://mcma.ebu.ch/rfc7807/generic-job-failure",
                title: "Generic job failure",
                detail: message
            }));
        } catch (inner) {
            workerRequest.logger?.error(inner.toString());
        }
    }
}
