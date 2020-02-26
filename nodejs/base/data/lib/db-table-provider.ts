import { McmaResource, McmaResourceType } from "@mcma/core";
import { DbTable } from "./db-table";

export interface DbTableProvider {
    get<T extends McmaResource>(type: McmaResourceType<T>, tableName: string): DbTable<T>;
}