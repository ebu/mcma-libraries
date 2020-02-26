import { McmaObject } from "./mcma-object";

export interface JobParameterProperties {
    parameterName: string;
    parameterType: string;
}

export class JobParameter extends McmaObject implements JobParameterProperties {
    parameterName: string;
    parameterType: string;

    constructor(properties: JobParameterProperties) {
        super("JobParameter", properties);

        this.checkProperty("parameterName", "string")
        this.checkProperty("parameterType", "string")
    }
}