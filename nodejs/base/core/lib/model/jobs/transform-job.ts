import { Job, JobProperties } from "./job";

export class TransformJob extends Job {
    constructor(properties: JobProperties) {
        super("TransformJob", properties);
    }
}