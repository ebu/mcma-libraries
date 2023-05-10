import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface JobParameterBagProperties extends McmaObjectProperties {
    [key: string]: any;
}

export class JobParameterBag extends McmaObject implements JobParameterBagProperties {
    [key: string]: any;

    constructor(properties?: { [key: string]: any }) {
        super("JobParameterBag");
        Object.assign(this, properties);
        this["@type"] = "JobParameterBag";
    }
}
