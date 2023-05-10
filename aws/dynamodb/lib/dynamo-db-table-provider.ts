import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";
import { DynamoDbTableOptions } from "./dynamo-db-table-options";
import { getTableDescription } from "./dynamo-db-table-description";

export class DynamoDbTableProvider implements DocumentDatabaseTableProvider {
    
    constructor(
        private readonly options: DynamoDbTableOptions = {},
        private readonly dynamoDBClient = new DynamoDBClient({})) {
    }

    async get(tableName: string): Promise<DocumentDatabaseTable> {
        return new DynamoDbTable(this.dynamoDBClient, await getTableDescription(this.dynamoDBClient, tableName), this.options);
    }
}
