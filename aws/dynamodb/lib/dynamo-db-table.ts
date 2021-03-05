import { types } from "util";
import { DynamoDB } from "aws-sdk";
import { DocumentClient, Key } from "aws-sdk/clients/dynamodb";
import { McmaException, Utils } from "@mcma/core";
import { CustomQuery, CustomQueryParameters, Document, DocumentDatabaseMutex, DocumentDatabaseTable, hasFilterCriteria, MutexProperties, Query, QueryResults } from "@mcma/data";

import { DynamoDbTableOptions } from "./dynamo-db-table-options";
import { buildFilterExpression } from "./build-filter-expression";
import { DynamoDbTableDescription } from "./dynamo-db-table-description";
import { DynamoDbMutex } from "./dynamo-db-mutex";

function parsePartitionAndSortKeys(id: string): { partitionKey: string, sortKey: string } {
    const lastSlashIndex = id.lastIndexOf("/");
    return lastSlashIndex > 0
        ? { partitionKey: id.substr(0, lastSlashIndex), sortKey: id.substr(lastSlashIndex + 1) }
        : { partitionKey: id, sortKey: id };
}

function keyFromBase64Json(str: string): Key {
    if (!str) {
        return undefined;
    }
    try {
        return JSON.parse(Utils.fromBase64(str));
    } catch (e) {
        throw new McmaException(`Invalid key '${str}'.`);
    }
}

function base64JsonFromKey(key: Key): string {
    return key ? Utils.toBase64(JSON.stringify(key)) : undefined;
}

export class DynamoDbTable implements DocumentDatabaseTable {
    private readonly docClient: DocumentClient;

    constructor(
        dynamoDb: DynamoDB,
        private tableDescription: DynamoDbTableDescription,
        private options?: DynamoDbTableOptions
    ) {
        this.docClient = new DocumentClient({ service: dynamoDb });
    }

    private serialize(object: any) {
        let copy: any;
        if (object) {
            copy = Array.isArray(object) ? [] : {};
            for (const key of Object.keys(object)) {
                const value = object[key];
                if (types.isDate(value) && !isNaN(value.getTime())) {
                    copy[key] = value.toISOString();
                } else if (typeof value === "object") {
                    copy[key] = this.serialize(value);
                } else {
                    copy[key] = value;
                }
            }
        }
        return copy;
    }

    private deserialize(object: any) {
        let copy: any;
        if (object) {
            copy = Array.isArray(object) ? [] : {};
            for (const key of Object.keys(object)) {
                const value = object[key];
                if (Utils.isValidDateString(value)) {
                    copy[key] = new Date(value);
                } else if (typeof value === "object") {
                    copy[key] = this.deserialize(value);
                } else {
                    copy[key] = value;
                }
            }
        }
        return copy;
    }

    async query<TDocument extends Document = Document>(query: Query<TDocument>): Promise<QueryResults<TDocument>> {
        let keyNames = this.tableDescription.keyNames;
        let keyConditionExpression = "#partitionKey = :partitionKey";
        let expressionAttributeNames: DocumentClient.ExpressionAttributeNameMap = { "#partitionKey": keyNames.partition };
        let expressionAttributeValues: DocumentClient.ExpressionAttributeValueMap = { ":partitionKey": query.path };

        let filterExpression: string;
        if (hasFilterCriteria(query.filterExpression)) {
            const dynamoDbExpression = buildFilterExpression(query.filterExpression);

            filterExpression = dynamoDbExpression.expressionStatement;
            expressionAttributeNames = Object.assign(expressionAttributeNames, dynamoDbExpression.expressionAttributeNames);
            expressionAttributeValues = Object.assign(expressionAttributeValues, dynamoDbExpression.expressionAttributeValues);
        }

        let indexName;
        if (query.sortBy) {
            const matchingIndex = this.tableDescription.localSecondaryIndexes.find(x => x.sortKeyName?.toLowerCase() === query.sortBy.toLowerCase());
            if (!matchingIndex) {
                throw new McmaException(`No matching local secondary index found for sorting by '${query.sortBy}'`);
            }
            indexName = matchingIndex.name;
        }

        const params: DocumentClient.QueryInput = {
            TableName: this.tableDescription.tableName,
            KeyConditionExpression: keyConditionExpression,
            FilterExpression: filterExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            IndexName: indexName,
            ScanIndexForward: query.sortAscending ?? true,
            ConsistentRead: this.options?.consistentQuery,
            Limit: query.pageSize,
            ExclusiveStartKey: keyFromBase64Json(query.pageStartToken)
        };

        const data = await this.docClient.query(params).promise();

        return {
            results: data.Items.map(i => this.deserialize(i.resource)),
            nextPageStartToken: base64JsonFromKey(data.LastEvaluatedKey)
        };
    }

    async customQuery<TDocument extends Document = Document, TParameters extends CustomQueryParameters = CustomQueryParameters>(
        query: CustomQuery<TDocument, TParameters>
    ): Promise<QueryResults<TDocument>> {
        const getQueryInputFromCustomQuery = this.options.customQueryRegistry[query.name];
        if (!getQueryInputFromCustomQuery) {
            throw new McmaException(`Custom query with name '${query.name}' has not been configured.`);
        }

        const params = getQueryInputFromCustomQuery(query);

        params.TableName = this.tableDescription.tableName;
        params.ExclusiveStartKey = keyFromBase64Json(query.pageStartToken);

        const data = await this.docClient.query(params).promise();

        return {
            results: data.Items.map(i => this.deserialize(i.resource)),
            nextPageStartToken: base64JsonFromKey(data.LastEvaluatedKey)
        };
    }

    async get<TDocument extends Document = Document>(id: string): Promise<TDocument> {
        const { partitionKey, sortKey } = parsePartitionAndSortKeys(id);
        const params: DocumentClient.GetItemInput = {
            TableName: this.tableDescription.tableName,
            Key: {
                [this.tableDescription.keyNames.partition]: partitionKey,
                [this.tableDescription.keyNames.sort]: sortKey
            },
            ConsistentRead: this.options?.consistentGet
        };

        const data = await this.docClient.get(params).promise();

        return data?.Item?.resource ? this.deserialize(data.Item.resource) : null;
    }

    async put<TDocument extends Document = Document>(id: string, resource: TDocument): Promise<TDocument> {
        const { partitionKey, sortKey } = parsePartitionAndSortKeys(id);
        const serializedResource = this.serialize(resource);

        let item = {
            [this.tableDescription.keyNames.partition]: partitionKey,
            [this.tableDescription.keyNames.sort]: sortKey,
            resource: serializedResource
        };

        if (this.options?.topLevelAttributeMappings) {
            for (let topLevelAttributeMappingKey of Object.keys(this.options.topLevelAttributeMappings)) {
                item[topLevelAttributeMappingKey] = this.options.topLevelAttributeMappings[topLevelAttributeMappingKey](partitionKey, sortKey, resource);
            }
        }

        const params: DocumentClient.PutItemInput = {
            TableName: this.tableDescription.tableName,
            Item: item
        };
        try {
            await this.docClient.put(params).promise();
        } catch (error) {
            throw new McmaException("Failed to put resource in DynamoDB table", error);
        }

        return resource;
    }

    async delete(id: string): Promise<void> {
        const { partitionKey, sortKey } = parsePartitionAndSortKeys(id);
        const params: DocumentClient.DeleteItemInput = {
            TableName: this.tableDescription.tableName,
            Key: {
                [this.tableDescription.keyNames.partition]: partitionKey,
                [this.tableDescription.keyNames.sort]: sortKey
            }
        };
        try {
            await this.docClient.delete(params).promise();
        } catch (error) {
            throw new McmaException("Failed to delete resource in DynamoDB table", error);
        }
    }

    createMutex(mutexProperties: MutexProperties): DocumentDatabaseMutex {
        return new DynamoDbMutex(this.docClient, this.tableDescription, mutexProperties.name, mutexProperties.holder, mutexProperties.lockTimeout, mutexProperties.logger);
    }
}
