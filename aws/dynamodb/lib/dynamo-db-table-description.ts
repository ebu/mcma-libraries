import { DescribeTableCommand, DynamoDBClient, KeySchemaElement } from "@aws-sdk/client-dynamodb";

export interface DynamoDbTableDescription {
    tableName: string;
    keyNames: KeyNames;
    localSecondaryIndexes: LocalSecondaryIndexDescription[];
    globalSecondaryIndexes: GlobalSecondaryIndexDescription[];
}

export interface KeyNames {
    partition: string;
    sort?: string;
}

export interface LocalSecondaryIndexDescription {
    name: string;
    sortKeyName: string;
}

export interface GlobalSecondaryIndexDescription {
    name: string;
    keyNames: KeyNames;
}

const tableDescriptions: { [key: string]: DynamoDbTableDescription } = {};

function getKeyNames(keySchema: KeySchemaElement[]): KeyNames {
    let partitionKeyName: string;
    let sortKeyName: string;
    for (const key of keySchema) {
        switch (key.KeyType) {
            case "HASH":
                partitionKeyName = key.AttributeName;
                break;
            case "RANGE":
                sortKeyName = key.AttributeName;
                break;
        }
    }
    return {
        partition: partitionKeyName,
        sort: sortKeyName
    };
}

export async function getTableDescription(dynamoDBClient: DynamoDBClient, tableName: string): Promise<DynamoDbTableDescription> {
    if (tableDescriptions[tableName]) {
        return tableDescriptions[tableName];
    }
    
    const data = await dynamoDBClient.send(new DescribeTableCommand({ TableName: tableName }));
    const globalSecondaryIndexes = (data.Table.GlobalSecondaryIndexes ?? []).map(i => ({
        name: i.IndexName,
        keyNames: getKeyNames(i.KeySchema)
    }));
    const localSecondaryIndexes = (data.Table.LocalSecondaryIndexes ?? []).map(i => ({
        name: i.IndexName,
        sortKeyName: getKeyNames(i.KeySchema).sort
    }));

    return {
        tableName,
        keyNames: getKeyNames(data.Table.KeySchema),
        localSecondaryIndexes,
        globalSecondaryIndexes
    };
}
