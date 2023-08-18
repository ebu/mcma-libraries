import { Job, JobProperties } from "./job";

export class StorageJob extends Job {
    constructor(properties: JobProperties) {
        super("StorageJob", properties);
    }
}
