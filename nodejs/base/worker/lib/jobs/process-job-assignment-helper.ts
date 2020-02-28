import { JobAssignment, JobStatus, JobParameterBag, McmaException, Logger, Job, JobProfile } from "@mcma/core";
import { DbTable } from "@mcma/data";
import { ResourceManager } from "@mcma/client";

import { WorkerRequest } from "../worker-request";

export class ProcessJobAssignmentHelper<T extends Job> {
    private jobAssignmentId: string;
    private jobAssignment: JobAssignment;
    
    private _job: T;
    private _profile: JobProfile;

    constructor(
        public readonly dbTable: DbTable<JobAssignment>,
        public readonly resourceManager: ResourceManager,
        public readonly logger: Logger,
        public readonly workerRequest: WorkerRequest
    ) {
        this.jobAssignmentId = workerRequest.input.jobAssignmentId;
    }

    get job() { return this._job; }
    get profile() { return this._profile; }

    async initialize() {
        this.jobAssignment = await this.updateJobAssignmentStatus(JobStatus.Running);

        this._job = await this.resourceManager.get<T>(typeof this.jobAssignment.job === "string" ? this.jobAssignment.job : this.jobAssignment.job.id);

        this._profile = await this.resourceManager.get<JobProfile>(typeof this._job.jobProfile === "string" ? this._job.jobProfile : this._job.jobProfile.id);

        this._job.jobOutput = this.jobAssignment.jobOutput || new JobParameterBag();
    }

    validateJob(): void {
        if (this._profile.inputParameters) {
            const missingInputParams = [];
            const jobInputKeys = this._job.jobInput && Object.keys(this._job.jobInput);
            for (const inputParam of this._profile.inputParameters) {
                if (!jobInputKeys || !jobInputKeys.includes(inputParam.parameterName)) {
                    missingInputParams.push(inputParam.parameterName);
                }
            }
            if (missingInputParams.length > 0) {
                throw new McmaException("One or more required input parameters are missing from the job: " + missingInputParams.join(", "));
            }
        }
    }

    async complete(message?: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = JobStatus.Completed;
                ja.statusMessage = message;
                ja.jobOutput = this._job.jobOutput;
            },
            true);
    }

    async fail(message: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = JobStatus.Failed;
                ja.statusMessage = message;
                ja.jobOutput = this._job.jobOutput;
            },
            true);
    }

    async cancel(message?: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = JobStatus.Canceled;
                ja.statusMessage = message;
                ja.jobOutput = this._job.jobOutput;
            },
            true);
    }

    async updateJobAssignmentOutput(): Promise<JobAssignment> {
        return await this.updateJobAssignment(ja => ja.jobOutput = this._job.jobOutput);
    }

    async updateJobAssignmentStatus(status: string, statusMessage?: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = status;
                ja.statusMessage = statusMessage;
            },
            true);
    }

    async updateJobAssignment(update: (jobAssigment: JobAssignment) => void, sendNotification = false): Promise<JobAssignment> {
        let jobAssignment = this.jobAssignment;
        if (typeof update !== "function") {
            throw new McmaException("update must be a function that modifies the JobAssignment.");
        }
        jobAssignment = await this.dbTable.get(this.jobAssignmentId);
        if (!jobAssignment) {
            throw new McmaException("JobAssignment with id '" + this.jobAssignmentId + "' not found.");
        }

        update(jobAssignment);

        jobAssignment.dateModified = new Date();
        await this.dbTable.put(jobAssignment.id, jobAssignment);

        if (sendNotification) {
            await this.sendNotification();
        }

        return jobAssignment;
    }

    async sendNotification(): Promise<void> {
        if (this.resourceManager && this.jobAssignment.notificationEndpoint) {
            await this.resourceManager.sendNotification(this.jobAssignment);
        }
    }
}