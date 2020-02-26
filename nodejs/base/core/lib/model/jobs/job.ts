import { JobProfileProperties, JobProfile } from "../job-profile";
import { JobParameterBag } from "../job-parameter-bag";
import { JobBase, JobBaseProperties } from "../job-base";
import { JobProcessProperties, JobProcess } from "../job-process";

export interface JobProperties extends JobBaseProperties {
    jobProfile: string | JobProfileProperties;
    jobProcess: string | JobProcessProperties;
    jobInput?: JobParameterBag;
}

export class Job extends JobBase<JobProperties> implements JobProperties {
    jobProfile: string | JobProfileProperties;
    jobProcess: string | JobProcessProperties;
    jobInput?: JobParameterBag;

    constructor(type: string, properties: JobProperties) {
        super(type, properties);

        this.checkProperty("jobProfile", "resource", true);
        this.checkProperty("jobProcess", "resource", true);
        this.checkProperty("jobInput", "resource", true);

        if (typeof this.jobProfile === "object") {
            this.jobProfile = new JobProfile(this.jobProfile);
        }
        if (typeof this.jobProcess === "object") {
            this.jobProcess = new JobProcess(this.jobProcess);
        }
        if (typeof this.jobInput === "object") {
            this.jobInput = new JobParameterBag(this.jobInput);
        }
    }
}