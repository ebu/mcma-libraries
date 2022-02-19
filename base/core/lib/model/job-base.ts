import { JobParameterBag, JobParameterBagProperties } from "./job-parameter-bag";
import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { ProblemDetail, ProblemDetailProperties } from "./problem-detail";
import { JobStatus } from "./job-status";

export interface JobBaseProperties extends McmaResourceProperties {
    status?: JobStatus;
    error?: ProblemDetailProperties;
    jobOutput?: JobParameterBagProperties;
    progress?: number;
}

export abstract class JobBase<T extends JobBaseProperties> extends McmaResource implements JobBaseProperties {
    status?: JobStatus;
    error?: ProblemDetail;
    jobOutput?: JobParameterBag;
    progress?: number;

    protected constructor(type: string, properties: T) {
        super(type, properties);

        this.checkProperty("status", "string", false);
        this.checkProperty("error", "object", false);
        this.checkProperty("jobOutput", "object", false);
        this.checkProperty("progress", "number", false);

        if (typeof this.error === "object") {
            this.error = new ProblemDetail(this.error);
        }

        this.jobOutput = new JobParameterBag(properties.jobOutput);

    }
}
