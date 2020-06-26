import { getTableName, Job, JobAssignment, McmaException, McmaResourceType, Utils } from "@mcma/core";
import { ProcessJobAssignmentHelper } from "./process-job-assignment-helper";
import { ProviderCollection } from "../provider-collection";
import { WorkerRequest } from "../worker-request";
import { JobProfileHandler } from "./job-profile-handler";
import { ProcessJobProfile } from "./process-job-profile";
import { ProblemDetail } from "@mcma/core/dist/lib/model/problem-detail";

export class ProcessJobAssignmentOperation<T extends Job> {
    private readonly jobType: string;
    private profiles: ProcessJobProfile<T>[] = [];

    constructor(jobType: McmaResourceType<T>) {
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

    async accepts(providerCollection: ProviderCollection, workerRequest: WorkerRequest, ctx: any): Promise<boolean> {
        return workerRequest.operationName === "ProcessJobAssignment";
    }

    async execute(providerCollection: ProviderCollection, workerRequest: WorkerRequest, ctx?: any) {
        if (!workerRequest) {
            throw new McmaException("request must be provided");
        }
        if (!workerRequest.input) {
            throw new McmaException("request.input is required.");
        }
        if (!workerRequest.input.jobAssignmentId) {
            throw new McmaException("request.input does not specify a jobAssignmentId");
        }

        const dbTable = providerCollection.dbTableProvider.get(getTableName(workerRequest), JobAssignment);
        const resourceManager = providerCollection.resourceManagerProvider.get(workerRequest);

        const jobAssignmentHelper = new ProcessJobAssignmentHelper<T>(dbTable, resourceManager, workerRequest);

        try {
            workerRequest.logger?.info("Initializing job helper...");

            await jobAssignmentHelper.initialize();

            workerRequest.logger?.info("Validating job...");

            if (jobAssignmentHelper.job["@type"] !== this.jobType) {
                throw new McmaException("Job has type '" + jobAssignmentHelper.job["@type"] + "', which does not match expected job type '" + this.jobType + "'.");
            }

            const matchedProfile = this.profiles.find(p => jobAssignmentHelper.profile.name === p.name);
            if (!matchedProfile) {
                throw new McmaException("Job profile '" + jobAssignmentHelper.profile.name + "' is not supported.");
            }

            jobAssignmentHelper.validateJob();

            workerRequest.logger?.info("Found handler for job profile '" + jobAssignmentHelper.profile.name + "'");

            await matchedProfile.execute(providerCollection, jobAssignmentHelper, ctx);

            workerRequest.logger?.info("Handler for job profile '" + jobAssignmentHelper.profile.name + "' completed");
        } catch (e) {
            workerRequest.logger?.error(e.message);
            workerRequest.logger?.error(e.toString());
            try {
                await jobAssignmentHelper.fail(new ProblemDetail({
                    type: "uri://mcma.ebu.ch/rfc7807/generic-job-failure",
                    title: "Generic Job failure",
                    detail: e.message
                }));
            } catch (inner) {
                workerRequest.logger?.error(inner.toString());
            }
        }
    }
}
