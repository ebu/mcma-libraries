import { Job, JobProperties } from "./job";

export class AIJob extends Job {
    constructor(properties: JobProperties) {
        super("AIJob", properties);
    }
}