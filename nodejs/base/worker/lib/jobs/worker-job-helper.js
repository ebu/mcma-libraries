const { JobStatus, JobParameterBag, Utils } = require("@mcma/core");

class WorkerJobHelper {
    constructor(jobType, dbTable, resourceManager, request, jobAssignmentId) {
        jobType = Utils.getTypeName(jobType);
        if (!jobType) {
            throw new Error("Worker job helper requires a valid job type to be specified.");
        }

        let jobAssignment;
        let job;
        let profile;
        let matchedProfileName;

        this.getTable = () => dbTable;
        this.getResourceManager = () => resourceManager;
        this.getRequest = () => request;
        this.getJobAssignmentId = () => jobAssignmentId;
        this.getJobAssignment = () => jobAssignment;
        this.getJob = () => job;
        this.getProfile = () => profile;
        this.getMatchedProfileName = () => matchedProfileName;
        this.getJobInput = () => job.jobInput;
        this.getJobOutput = () => job.jobOutput;

        this.initialize = async () => {
            jobAssignment = await this.updateJobAssignmentStatus(JobStatus.running);

            job = await resourceManager.resolve(jobAssignment.job);

            profile = await resourceManager.resolve(job.jobProfile);

            job.jobOutput = new JobParameterBag();
        };

        this.validateJob = (supportedProfiles) => {
            if ((job["@type"] || "").toLowerCase() !== jobType.toLowerCase()) {
                throw new Error("Job has type '" + job["@type"] + "', which does not match expected job type '" + jobType + "'.");
            }

            supportedProfiles = supportedProfiles || [];
            matchedProfileName = supportedProfiles.find(x => x && profile.name.toLowerCase() === x.toLowerCase());
            if (!matchedProfileName) {
                throw new Error(`Job profile "${profile.name}" is not supported.`);
            }

            if (profile.inputParameters) {
                const missingInputParams = [];
                const jobInputKeys = job.jobInput && Object.keys(job.jobInput);
                for (const inputParam of profile.inputParameters) {
                    if (!jobInputKeys || !jobInputKeys.includes(inputParam.parameterName)) {
                        missingInputParams.push(inputParam.parameterName);
                    }
                }
                if (missingInputParams.length > 0) {
                    throw new Error("One or more required input parameters are missing from the job: " + missingInputParams.join(", "));
                }
            }
        };

        this.fail = async (error) => {
            if (typeof error !== "string") {
                error = JSON.stringify(error);
            }
            return await this.updateJobAssignmentStatus(JobStatus.failed, error);
        };

        this.complete = async () => {
            await this.updateJobAssignmentOutput();
            return await this.updateJobAssignmentStatus(JobStatus.completed);
        };

        this.updateJobAssignmentOutput = async () => {
            return await this.updateJobAssignment(ja => ja.jobOutput = job.jobOutput);
        };

        this.updateJobAssignmentStatus = async (status, statusMessage) => {
            if (typeof status === "object" && status.name) {
                status = status.name;
            }
            return await this.updateJobAssignment(
                ja => {
                    ja.status = status;
                    ja.statusMessage = statusMessage;
                },
                true);
        };

        this.updateJobAssignment = async (update, sendNotification = false) => {
            if (typeof update !== "function") {
                throw new Error("update must be a function that modifies the JobAssignment.");
            }
            jobAssignment = await dbTable.get(jobAssignmentId);
            if (!jobAssignment) {
                throw new Error("JobAssignment with id '" + jobAssignmentId + "' not found.");
            }

            update(jobAssignment);

            jobAssignment.dateModified = new Date().toISOString();
            await dbTable.put(jobAssignmentId, jobAssignment);

            if (sendNotification) {
                await this.sendNotification();
            }

            return jobAssignment;
        };

        this.sendNotification = async () => {
            if (resourceManager) {
                await resourceManager.sendNotification(jobAssignment);
            }
        };
    }
}

module.exports = {
    WorkerJobHelper
};
