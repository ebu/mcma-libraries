import { Job, JobProperties } from "./job";

export class DistributionJob extends Job {
    constructor(properties: JobProperties) {
        super("DistributionJob", properties);
    }
}
