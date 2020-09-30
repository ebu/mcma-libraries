import { JobBase, JobBaseProperties } from "./job-base";

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

        this.checkProperty("jobAssignmentId", "url", false);
        this.checkProperty("actualDuration", "number", false);

        this.actualStartDate = this.ensureValidDateOrUndefined(this.actualStartDate);
        this.actualEndDate = this.ensureValidDateOrUndefined(this.actualEndDate);
    }
}
