import { McmaResource } from "./mcma-resource";

export interface McmaResourceConstructor<T extends McmaResource> {
    new(...args: any[]): T;

    name: string;
}

export type McmaResourceType<T extends McmaResource> = string | McmaResourceConstructor<T>;
