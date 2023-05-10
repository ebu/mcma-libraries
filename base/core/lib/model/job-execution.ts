import { JobBase, JobBaseProperties } from "./job-base";
import { Utils } from "../utils";

export interface JobExecutionProperties extends JobBaseProperties {
    jobAssignmentId?: string;

    actualStartDate?: Date | string;
    actualEndDate?: Date | string;
    actualDuration?: number;
}

export class JobExecution extends JobBase<JobExecutionProperties> implements JobExecutionProperties {
    jobAssignmentId?: string;

    actualStartDate?: Date;
    actualEndDate?: Date;
    actualDuration?: number;

    constructor(properties: JobExecutionProperties) {
        super("JobExecution", properties);
        this.jobAssignmentId = properties.jobAssignmentId;
        this.actualStartDate = Utils.ensureValidDateOrUndefined(properties.actualStartDate);
        this.actualEndDate = Utils.ensureValidDateOrUndefined(properties.actualEndDate);
        this.actualDuration = properties.actualDuration;

        Utils.checkProperty(this, "jobAssignmentId", "url", false);
        Utils.checkProperty(this, "actualDuration", "number", false);
    }
}
