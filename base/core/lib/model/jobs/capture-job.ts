import { Job, JobProperties } from "./job";

export class CaptureJob extends Job {
    constructor(properties: JobProperties) {
        super("CaptureJob", properties);
    }
}