import { McmaResource, McmaResourceType, Job } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";

export class DynamoDbTableProvider implements DbTableProvider {
    get<T extends McmaResource>(type: McmaResourceType<T>, tableName: string) {
        return new DynamoDbTable<T>(type, tableName);
    }
}
