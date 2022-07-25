import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface JobParameterProperties extends McmaObjectProperties {
    parameterName: string;
    parameterType: string;
}

export class JobParameter extends McmaObject implements JobParameterProperties {
    parameterName: string;
    parameterType: string;

    constructor(properties: JobParameterProperties) {
        super("JobParameter", properties);

        Utils.checkProperty(this, "parameterName", "string");
        Utils.checkProperty(this, "parameterType", "string");
    }
}
