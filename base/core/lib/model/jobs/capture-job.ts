import { Job, JobProperties } from "./job.js";

export class CaptureJob extends Job {
    constructor(properties: JobProperties) {
        super("CaptureJob", properties);
    }
}