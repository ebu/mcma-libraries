import { JobBaseProperties, JobBase } from "./job-base";
import { JobProperties } from "./jobs/job";

export interface JobProcessProperties extends JobBaseProperties {
    job: string | JobProperties;
}

export class JobProcess extends JobBase<JobProcessProperties> implements JobProcessProperties {
    job: string | JobProperties;

    constructor(properties: JobProcessProperties) {
        super("JobProcess", properties);

        this.checkProperty("job", "resource");
    }
}