import { Job, JobProperties } from "./job";

export class AmeJob extends Job {
    constructor(properties: JobProperties) {
        super("AmeJob", properties);
    }
}