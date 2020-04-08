import { JobBaseProperties, JobBase } from "./job-base";

export interface JobProcessProperties extends JobBaseProperties {
    job: string;
    jobAssignment?: string;

    actualStartDate?: Date;
    actualEndDate?: Date;
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
    }
}