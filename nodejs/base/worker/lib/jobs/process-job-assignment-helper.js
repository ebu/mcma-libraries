const { JobStatus, JobParameterBag, Exception } = require("@mcma/core");

class ProcessJobAssignmentHelper {
    constructor(dbTable, resourceManager, logger, workerRequest) {
        const jobAssignmentId = workerRequest.input.jobAssignmentId;

        let jobAssignment;
        let job;
        let profile;

        this.getTable = () => dbTable;
        this.getResourceManager = () => resourceManager;
        this.getLogger = () => logger;
        this.getRequest = () => workerRequest;

        this.getJobAssignmentId = () => jobAssignmentId;
        this.getJobAssignment = () => jobAssignment;
        this.getJob = () => job;
        this.getProfile = () => profile;
        this.getJobInput = () => job.jobInput;
        this.getJobOutput = () => job.jobOutput;

        this.initialize = async () => {
            jobAssignment = await this.updateJobAssignmentStatus(JobStatus.Running);

            job = await resourceManager.get(jobAssignment.job);

            profile = await resourceManager.get(job.jobProfile);

            job.jobOutput = jobAssignment.jobOutput || new JobParameterBag();
        };

        this.validateJob = () => {
            if (profile.inputParameters) {
                const missingInputParams = [];
                const jobInputKeys = job.jobInput && Object.keys(job.jobInput);
                for (const inputParam of profile.inputParameters) {
                    if (!jobInputKeys || !jobInputKeys.includes(inputParam.parameterName)) {
                        missingInputParams.push(inputParam.parameterName);
                    }
                }
                if (missingInputParams.length > 0) {
                    throw new Exception("One or more required input parameters are missing from the job: " + missingInputParams.join(", "));
                }
            }
        };

        this.complete = async (message) => {
            return await this.updateJobAssignment(
                ja => {
                    ja.status = JobStatus.Completed;
                    ja.statusMessage = message;
                    ja.jobOutput = job.jobOutput;
                },
                true);
        };

        this.fail = async (message) => {
            return await this.updateJobAssignment(
                ja => {
                    ja.status = JobStatus.Failed;
                    ja.statusMessage = message;
                    ja.jobOutput = job.jobOutput;
                },
                true);
        };

        this.cancel = async (message) => {
            return await this.updateJobAssignment(
                ja => {
                    ja.status = JobStatus.Canceled;
                    ja.statusMessage = message;
                    ja.jobOutput = job.jobOutput;
                },
                true);
        };

        this.updateJobAssignmentOutput = async () => {
            return await this.updateJobAssignment(ja => ja.jobOutput = job.jobOutput);
        };

        this.updateJobAssignmentStatus = async (status, statusMessage) => {
            return await this.updateJobAssignment(
                ja => {
                    ja.status = status;
                    ja.statusMessage = statusMessage;
                },
                true);
        };

        this.updateJobAssignment = async (update, sendNotification = false) => {
            if (typeof update !== "function") {
                throw new Exception("update must be a function that modifies the JobAssignment.");
            }
            jobAssignment = await dbTable.get(jobAssignmentId);
            if (!jobAssignment) {
                throw new Exception("JobAssignment with id '" + jobAssignmentId + "' not found.");
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
    ProcessJobAssignmentHelper
};
