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

        if (this.actualStartDate !== undefined && this.actualStartDate !== null) {
            this.actualStartDate = new Date(this.actualStartDate);
        }
        if (this.actualEndDate !== undefined && this.actualEndDate !== null) {
            this.actualEndDate = new Date(this.actualEndDate);
        }
    }
}
