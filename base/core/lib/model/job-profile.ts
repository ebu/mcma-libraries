import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { JobParameter } from "./job-parameter";

export interface JobProfileProperties extends McmaResourceProperties {
    name: string;
    inputParameters?: JobParameter[];
    outputParameters?: JobParameter[];
    optionalInputParameters?: JobParameter[];
}

export class JobProfile extends McmaResource implements JobProfileProperties {
    name: string;
    inputParameters?: JobParameter[];
    outputParameters?: JobParameter[];
    optionalInputParameters?: JobParameter[];

    constructor(properties: JobProfileProperties) {
        super("JobProfile", properties);

        this.checkProperty("name", "string", true);
        this.checkProperty("inputParameters", "Array", false);
        this.checkProperty("outputParameters", "Array", false);
        this.checkProperty("optionalInputParameters", "Array", false);
        this.checkProperty("customProperties", "object", false);
    }
}
