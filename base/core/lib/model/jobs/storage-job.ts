import { Job, JobProperties } from "./job.js";

export class StorageJob extends Job {
    constructor(properties: JobProperties) {
        super("StorageJob", properties);
    }
}
