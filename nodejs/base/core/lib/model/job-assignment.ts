import { JobBase, JobBaseProperties } from "./job-base";

export interface JobAssignmentProperties extends JobBaseProperties {
    job: string;
}

export class JobAssignment extends JobBase<JobAssignmentProperties> implements JobAssignmentProperties {
    job: string;
    
    constructor(properties: JobAssignmentProperties) {
        super("JobAssignment", properties);

        this.checkProperty("job", "resource");
    }
}