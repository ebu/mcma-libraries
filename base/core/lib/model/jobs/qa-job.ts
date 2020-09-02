import { Job, JobProperties } from "./job";

export class QAJob extends Job {
    constructor(properties: JobProperties) {
        super("QAJob", properties);
    }
}