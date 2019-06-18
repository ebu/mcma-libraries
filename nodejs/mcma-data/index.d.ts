import { Resource, JobBase, ResourceType } from "mcma-core";

export abstract class DbTable<T extends Resource> {
    constructor(type: ResourceType);

    query(filter: any): Promise<T[]>;
    get(id: string): Promise<T>;
    put(id: string, resource: T): Promise<T>;
    delete(id: string): Promise<void>;

    getAndThrowIfNotFound<T extends Resource>(id: string): Promise<T>;
    updateJobStatus<T extends JobBase>(jobId: string, status?: string, statusMessage?: string): Promise<T>;
}

export type DbTableProvider<T extends Resource> = (tableName: string) => DbTable<T>;

export as namespace McmaData;