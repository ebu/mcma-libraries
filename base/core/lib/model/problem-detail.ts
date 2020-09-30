import { McmaObject, McmaObjectProperties } from "./mcma-object";

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

        this.checkProperty("type", "string", true);
        this.checkProperty("title", "string", true);
        this.checkProperty("detail", "string", false);
        this.checkProperty("instance", "string", false);
    }
}
