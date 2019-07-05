import { Resource } from "@mcma/core";
import { DbTable, DbTableProvider } from "@mcma/data";

export class DynamoDbTable<T extends Resource> extends DbTable<T> {
    constructor(type: string, tableName: string);
}

export class DynamoDbTableProvider<T extends Resource> {
    table: DbTableProvider<T>;
}