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
        super("JobParameter");
        this.parameterName = properties.parameterName;
        this.parameterType = properties.parameterType;

        Utils.checkProperty(this, "parameterName", "string");
        Utils.checkProperty(this, "parameterType", "string");
    }
}
