import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface ProblemDetailProperties extends McmaObjectProperties {
    type: string;
    title: string;
    detail?: string;
    instance?: string;
}

export class ProblemDetail extends McmaObject implements ProblemDetailProperties {
    type: string;
    title: string;
    detail?: string;
    instance?: string;

    constructor(properties?: ProblemDetailProperties) {
        super("ProblemDetail", properties);
    }
}
