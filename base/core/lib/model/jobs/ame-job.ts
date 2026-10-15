import { Job, JobProperties } from "./job.js";

export class AmeJob extends Job {
    constructor(properties: JobProperties) {
        super("AmeJob", properties);
    }
}