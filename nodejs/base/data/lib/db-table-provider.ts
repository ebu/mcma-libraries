import { McmaResource } from "@mcma/core";
import { DbTable } from "./db-table";

export interface DbTableProvider {
    get<T extends McmaResource>(tableName: string): DbTable<T>;
}