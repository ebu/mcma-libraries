import { Job, JobProperties } from "./job.js";

export class WorkflowJob extends Job {
    constructor(properties: JobProperties) {
        super("WorkflowJob", properties);
    }
}