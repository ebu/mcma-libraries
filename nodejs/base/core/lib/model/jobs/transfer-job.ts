import { Job, JobProperties } from "./job";

export class TransferJob extends Job {
    constructor(properties: JobProperties) {
        super("TransferJob", properties);
    }
}