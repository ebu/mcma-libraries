import { McmaResource, McmaResourceType } from "@mcma/core";
import { DbTable } from "./db-table";

export interface DbTableProvider {
    get<T extends McmaResource>(tableName: string, type: McmaResourceType<T>): DbTable<T>;
}