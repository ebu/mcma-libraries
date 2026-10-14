import { Job, JobProperties } from "./job.js";

export class QAJob extends Job {
    constructor(properties: JobProperties) {
        super("QAJob", properties);
    }
}