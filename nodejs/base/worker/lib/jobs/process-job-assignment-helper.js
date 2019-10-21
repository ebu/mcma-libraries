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
            jobAssignment = await this.updateJobAssignmentStatus(JobStatus.RUNNING);

            job = await resourceManager.resolve(jobAssignment.job);

            profile = await resourceManager.resolve(job.jobProfile);

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

        this.complete = async () => {
            await this.updateJobAssignmentOutput();
            return await this.updateJobAssignmentStatus(JobStatus.COMPLETED);
        };

        this.fail = async (error) => {
            if (!!error && typeof error !== "string") {
                error = JSON.stringify(error);
            }
            return await this.updateJobAssignmentStatus(JobStatus.FAILED, error);
        };

        this.cancel = async (message) => {
            if (!!message && typeof message !== "string") {
                message = JSON.stringify(message);
            }
            return await this.updateJobAssignmentStatus(JobStatus.CANCELED, message);
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
