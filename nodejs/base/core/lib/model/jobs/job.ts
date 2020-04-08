import { JobProfileProperties, JobProfile } from "../job-profile";
import { JobParameterBag } from "../job-parameter-bag";
import { JobBase, JobBaseProperties } from "../job-base";
import { JobProcessProperties, JobProcess } from "../job-process";

export interface JobProperties extends JobBaseProperties {
    jobProfile: string;
    jobProcess?: string;
}

export class Job extends JobBase<JobProperties> implements JobProperties {
    jobProfile: string;
    jobProcess?: string;

    constructor(type: string, properties: JobProperties) {
        super(type, properties);

        this.checkProperty("jobProfile", "resource", true);
        this.checkProperty("jobProcess", "resource", false);
    }
}