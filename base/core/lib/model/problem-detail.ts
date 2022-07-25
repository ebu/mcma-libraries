import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface ProblemDetailProperties extends McmaObjectProperties {
    type: string;
    title: string;
    detail?: string;
    instance?: string;

    [key: string]: any;
}

export class ProblemDetail extends McmaObject implements ProblemDetailProperties {
    type: string;
    title: string;
    detail?: string;
    instance?: string;

    [key: string]: any;

    constructor(properties?: ProblemDetailProperties) {
        super("ProblemDetail", properties);

        Utils.checkProperty(this, "type", "string", true);
        Utils.checkProperty(this, "title", "string", true);
        Utils.checkProperty(this, "detail", "string", false);
        Utils.checkProperty(this, "instance", "string", false);
    }
}
