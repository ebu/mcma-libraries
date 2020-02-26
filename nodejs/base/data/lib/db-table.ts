import { Utils, McmaResource, McmaResourceType } from "@mcma/core";

export abstract class DbTable<T extends McmaResource> {
    protected type: string;

    constructor(type: string | McmaResourceType<T>) {
        this.type = Utils.getTypeName(type);
    }

    abstract query(filter: (resource:T) => boolean): Promise<T[]>;

    abstract get(id: string): Promise<T>;

    abstract put(id: string, resource: T): Promise<T>;

    abstract delete(id: string): Promise<void>
}