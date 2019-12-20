import { Resource, ResourceType } from "@mcma/core";
import { DbTable, DbTableProvider } from "@mcma/data";

export class DynamoDbTable<T extends Resource> extends DbTable<T> {
    constructor(tableName: string, type: ResourceType<T>);
}

export class DynamoDbTableProvider<T extends Resource> implements DbTableProvider<T> {
    constructor(type: ResourceType<T>);

    get(tableName: string): DbTable<T>;
}
