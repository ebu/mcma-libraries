import { McmaResource } from "./mcma-resource.js";

export interface McmaResourceConstructor<T extends McmaResource> {
    new(...args: any[]): T;

    name: string;
}

export type McmaResourceType<T extends McmaResource> = string | McmaResourceConstructor<T>;
