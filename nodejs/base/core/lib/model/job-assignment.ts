import { JobProperties } from "./jobs/job";
import { JobBase, JobBaseProperties } from "./job-base";

export interface JobAssignmentProperties extends JobBaseProperties {
    job: string | JobProperties;
}

export class JobAssignment extends JobBase<JobAssignmentProperties> implements JobAssignmentProperties {
    job: string | JobProperties;
    
    constructor(properties: JobAssignmentProperties) {
        super("JobAssignment", properties);

        this.checkProperty("job", "resource");
    }
}