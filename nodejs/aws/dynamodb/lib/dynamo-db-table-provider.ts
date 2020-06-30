import { DynamoDB } from "aws-sdk";
import { DocumentDatabaseTableProvider, DocumentDatabaseTable } from "@mcma/data";

import { DynamoDbTable } from "./dynamo-db-table";
import { DynamoDbTableOptions } from "./dynamo-db-table-options";
import { DynamoDbTableDescription } from "./dynamo-db-table-description";

export class DynamoDbTableProvider implements DocumentDatabaseTableProvider {
    private dynamoDb = new DynamoDB();
    private tableDescriptions: { [key: string]: DynamoDbTableDescription } = {};

    constructor(private options?: DynamoDbTableOptions) { }

    async get<TPartitionKey = string, TSortKey = string>(tableName: string): Promise<DocumentDatabaseTable<TPartitionKey, TSortKey>> {
        if (!this.tableDescriptions[tableName]) {
            this.tableDescriptions[tableName] = await this.describeTable(tableName);
        }

        return new DynamoDbTable<TPartitionKey, TSortKey>(this.tableDescriptions[tableName], this.options);
    }

    private async describeTable(tableName: string): Promise<DynamoDbTableDescription> {
        const data = await this.dynamoDb.describeTable({ TableName: tableName }).promise();

        const tableDescription: DynamoDbTableDescription = {
            tableName,
            partitionKeyName: null,
            sortKeyName: null
        };

        for (const key of data.Table.KeySchema) {
            switch (key.KeyType) {
                case "HASH":
                    tableDescription.partitionKeyName = key.AttributeName;
                    break;
                case "RANGE":
                    tableDescription.sortKeyName = key.AttributeName;
                    break;
            }
        }

        return tableDescription;
    }
}
