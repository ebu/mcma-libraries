import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { JobParameter, JobParameterProperties } from "./job-parameter";

export interface JobProfileProperties extends McmaResourceProperties {
    name: string;
    inputParameters?: JobParameterProperties[];
    outputParameters?: JobParameterProperties[];
    optionalInputParameters?: JobParameterProperties[];
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

        if (Array.isArray(this.inputParameters)) {
            this.inputParameters = this.inputParameters.map(ip => new JobParameter(ip));
        }
        if (Array.isArray(this.optionalInputParameters)) {
            this.optionalInputParameters = this.optionalInputParameters.map(ip => new JobParameter(ip));
        }
        if (Array.isArray(this.outputParameters)) {
            this.outputParameters = this.outputParameters.map(ip => new JobParameter(ip));
        }
    }
}
