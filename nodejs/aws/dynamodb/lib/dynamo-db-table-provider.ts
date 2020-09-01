import { DynamoDB } from "aws-sdk";
import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";
import { DynamoDbTableOptions } from "./dynamo-db-table-options";
import { getTableDescription } from "./dynamo-db-table-description";

export class DynamoDbTableProvider implements DocumentDatabaseTableProvider {
    
    constructor(
        private readonly options: DynamoDbTableOptions = {},
        private readonly dynamoDb = new DynamoDB()) {
    }

    async get(tableName: string): Promise<DocumentDatabaseTable> {
        return new DynamoDbTable(this.dynamoDb, await getTableDescription(this.dynamoDb, tableName), this.options);
    }
}
