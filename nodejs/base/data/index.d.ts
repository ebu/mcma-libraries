import { Resource, ResourceType } from "@mcma/core";

export abstract class DbTable<T extends Resource> {
    protected constructor(type: ResourceType<T>);

    query(filter: any): Promise<T[]>;
    get(id: string): Promise<T>;
    put(id: string, resource: T): Promise<T>;
    delete(id: string): Promise<void>;
}

export interface DbTableProvider<T extends Resource> {
    get(tableName: string): DbTable<T>;
}

export as namespace McmaData;
