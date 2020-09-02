import { Job, JobProperties } from "./job";

export class WorkflowJob extends Job {
    constructor(properties: JobProperties) {
        super("WorkflowJob", properties);
    }
}