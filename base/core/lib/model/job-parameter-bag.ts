import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface JobParameterBagProperties extends McmaObjectProperties {
    [key: string]: any;
}

export class JobParameterBag extends McmaObject implements JobParameterBagProperties {
    [key: string]: any;

    constructor(properties?: { [key: string]: any }) {
        super("JobParameterBag", properties);
    }

    get<T>(key: string): T {
        return this[key] as T;
    }

    set<T>(key: string, value: T): this {
        this[key] = value;
        return this;
    }
}
