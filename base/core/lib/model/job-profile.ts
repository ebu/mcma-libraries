import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { JobParameter, JobParameterProperties } from "./job-parameter";
import { Utils } from "../utils";

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
        this.name = properties.name;
        this.inputParameters = properties.inputParameters?.map(p => new JobParameter(p));
        this.optionalInputParameters = properties.optionalInputParameters?.map(p => new JobParameter(p));
        this.outputParameters = properties.outputParameters?.map(p => new JobParameter(p));

        Utils.checkProperty(this, "name", "string", true);
        Utils.checkProperty(this, "inputParameters", "Array", false);
        Utils.checkProperty(this, "outputParameters", "Array", false);
        Utils.checkProperty(this, "optionalInputParameters", "Array", false);
    }
}
