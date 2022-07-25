import { JobParameterBag, JobParameterBagProperties } from "./job-parameter-bag";
import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { ProblemDetail, ProblemDetailProperties } from "./problem-detail";
import { JobStatus } from "./job-status";
import { Utils } from "../utils";

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

        Utils.checkProperty(this, "status", "string", false);
        Utils.checkProperty(this, "error", "object", false);
        Utils.checkProperty(this, "jobOutput", "object", false);
        Utils.checkProperty(this, "progress", "number", false);

        if (typeof this.error === "object") {
            this.error = new ProblemDetail(this.error);
        }

        this.jobOutput = new JobParameterBag(properties.jobOutput);

    }
}
