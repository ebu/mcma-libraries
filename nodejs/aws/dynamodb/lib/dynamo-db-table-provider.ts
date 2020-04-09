import { McmaResource, McmaResourceType, Job } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";

export class DynamoDbTableProvider implements DbTableProvider {
    get<T extends McmaResource>(tableName: string, type: McmaResourceType<T>) {
        return new DynamoDbTable<T>(tableName, type);
    }
}
