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

        Utils.checkProperty(this, "jobAssignmentId", "url", false);
        Utils.checkProperty(this, "actualDuration", "number", false);

        this.actualStartDate = Utils.ensureValidDateOrUndefined(this.actualStartDate);
        this.actualEndDate = Utils.ensureValidDateOrUndefined(this.actualEndDate);
    }
}
