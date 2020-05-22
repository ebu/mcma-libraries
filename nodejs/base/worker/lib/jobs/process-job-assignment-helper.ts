import { Job, JobAssignment, JobParameterBag, JobProfile, JobStatus, Logger, McmaException, Utils } from "@mcma/core";
import { DbTable } from "@mcma/data";
import { ResourceManager } from "@mcma/client";

import { WorkerRequest } from "../worker-request";

export class ProcessJobAssignmentHelper<T extends Job> {
    private _jobAssignment: JobAssignment;
    private _job: T;
    private _profile: JobProfile;

    public readonly jobAssignmentId: string;

    constructor(
        public readonly dbTable: DbTable<JobAssignment>,
        public readonly resourceManager: ResourceManager,
        public readonly workerRequest: WorkerRequest
    ) {
        this.jobAssignmentId = workerRequest.input.jobAssignmentId;
    }

    get logger(): Logger | undefined {
        return this.workerRequest.logger;
    }
    get jobAssignment() {
        return this._jobAssignment;
    }
    get job() {
        return this._job;
    }
    get profile() {
        return this._profile;
    };
    get jobInput() {
        return this._job.jobInput;
    }
    get jobOutput() {
        return this._job.jobOutput;
    }

    async initialize() {
        this._jobAssignment = await this.updateJobAssignmentStatus(JobStatus.Running);

        this._job = await this.resourceManager.get<T>(this._jobAssignment.job);
        this._profile = await this.resourceManager.get<JobProfile>(this._job.jobProfile);

        this._job.jobInput = new JobParameterBag(this._job.jobInput);
        this._job.jobOutput = new JobParameterBag(this._jobAssignment.jobOutput);
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
                ja.jobOutput = this._job?.jobOutput;
            },
            true);
    }

    async fail(message: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = JobStatus.Failed;
                ja.statusMessage = message;
                ja.jobOutput = this._job?.jobOutput;
            },
            true);
    }

    async cancel(message?: string): Promise<JobAssignment> {
        return await this.updateJobAssignment(
            ja => {
                ja.status = JobStatus.Canceled;
                ja.statusMessage = message;
                ja.jobOutput = this._job?.jobOutput;
            },
            true);
    }

    async updateJobAssignmentOutput(): Promise<JobAssignment> {
        return await this.updateJobAssignment(ja => ja.jobOutput = this._job?.jobOutput);
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
        if (typeof update !== "function") {
            throw new McmaException("update must be a function that modifies the JobAssignment.");
        }

        let jobAssignment = await this.getJobAssignment();
        if (!jobAssignment) {
            throw new McmaException("JobAssignment with id '" + this.jobAssignmentId + "' not found.");
        }

        update(jobAssignment);

        jobAssignment.dateModified = new Date();
        await this.dbTable.put(jobAssignment.id, jobAssignment);

        this._jobAssignment = jobAssignment;

        if (sendNotification) {
            await this.sendNotification();
        }

        return jobAssignment;
    }

    // Automatic retry as the JobAssignment may not be retrievable yet in case it's attempted to do so immediately (in a few milliseconds) after insertion.
    private async getJobAssignment() {
        let jobAssignment = await this.dbTable.get(this.jobAssignmentId);

        for (const timeout of [5, 10, 15]) {
            if (jobAssignment) {
                break;
            }

            this.logger?.warn(`Failed to obtain job assignment from DynamoDB table. Trying again in ${timeout} seconds`);
            await Utils.sleep(timeout * 1000);
            jobAssignment = await this.dbTable.get(this.jobAssignmentId);
        }

        return jobAssignment;
    }

    async sendNotification(): Promise<void> {
        if (this.resourceManager && this._jobAssignment.notificationEndpoint) {
            await this.resourceManager.sendNotification(this._jobAssignment);
        }
    }
}
