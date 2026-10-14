import { Job, JobProperties } from "./job.js";

export class TransformJob extends Job {
    constructor(properties: JobProperties) {
        super("TransformJob", properties);
    }
}