import { DynamoDB } from "aws-sdk";

export interface DynamoDbTableDescription {
    tableName: string;
    partitionKeyName: string;
    sortKeyName: string;
}

const tableDescriptions: { [key: string]: DynamoDbTableDescription } = {};

export async function getTableDescription(dynamoDb: DynamoDB, tableName: string): Promise<DynamoDbTableDescription> {
    if (tableDescriptions[tableName]) {
        return tableDescriptions[tableName];
    }
    
    const data = await dynamoDb.describeTable({ TableName: tableName }).promise();

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