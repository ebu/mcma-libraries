import { Job, JobProperties } from "./job.js";

export class AIJob extends Job {
    constructor(properties: JobProperties) {
        super("AIJob", properties);
    }
}