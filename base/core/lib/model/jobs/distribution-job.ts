import { Job, JobProperties } from "./job.js";

export class DistributionJob extends Job {
    constructor(properties: JobProperties) {
        super("DistributionJob", properties);
    }
}
