import { McmaResource, McmaResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import { DynamoDbTable, DynamoDbTableOptions } from "./dynamo-db-table";

export class DynamoDbTableProvider implements DbTableProvider {
    constructor(private options?: DynamoDbTableOptions) {
    }

    get<T extends McmaResource>(tableName: string, type: McmaResourceType<T>) {
        return new DynamoDbTable<T>(tableName, type, this.options);
    }
}
