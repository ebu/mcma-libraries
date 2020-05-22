import { JobBaseProperties, JobBase } from "./job-base";

export interface JobProcessProperties extends JobBaseProperties {
    job: string;
    jobAssignment?: string;

    actualStartDate?: Date | string;
    actualEndDate?: Date | string;
    actualDuration?: number;
}

export class JobProcess extends JobBase<JobProcessProperties> implements JobProcessProperties {
    job: string;
    jobAssignment?: string;
    
    actualStartDate?: Date;
    actualEndDate?: Date;
    actualDuration?: number;

    constructor(properties: JobProcessProperties) {
        super("JobProcess", properties);

        this.checkProperty("job", "resource");

        this.actualStartDate = this.ensureValidDateOrUndefined(this.actualStartDate);
        this.actualEndDate = this.ensureValidDateOrUndefined(this.actualEndDate);
    }
}
