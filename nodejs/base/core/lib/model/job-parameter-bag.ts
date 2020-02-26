import { McmaObject } from "./mcma-object";

export class JobParameterBag extends McmaObject {
    constructor(properties?: { [key: string]: any }) {
        super("JobParameterBag", properties);
    }
}