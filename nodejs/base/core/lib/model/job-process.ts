import { JobBaseProperties, JobBase } from "./job-base";
import { JobProperties } from "./jobs/job";
import { JobAssignmentProperties } from "./job-assignment";

export interface JobProcessProperties extends JobBaseProperties {
    job: string | JobProperties;
    jobAssignment: string | JobAssignmentProperties;
}

export class JobProcess extends JobBase<JobProcessProperties> implements JobProcessProperties {
    job: string | JobProperties;
    jobAssignment: string | JobAssignmentProperties;

    constructor(properties: JobProcessProperties) {
        super("JobProcess", properties);

        this.checkProperty("job", "resource");
    }
}