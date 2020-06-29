import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { McmaException, Utils } from "@mcma/core";
import { DocumentDatabaseTable, DocumentType, DocumentDatabaseTableConfig, DocumentDatabaseQuery, Document } from "@mcma/data";
import { types } from "util";

import { DynamoDbTableOptions } from "./dynamo-db-table-options";
import { DynamoDbFilter } from "./dynamo-db-filter";

export class DynamoDbTable<TDocument extends Document = Document, TPartitionKey = string, TSortKey = string> extends DocumentDatabaseTable<TDocument, TPartitionKey, TSortKey> {
    private docClient = new DocumentClient();

    constructor(
        private tableName: string,
        type: DocumentType<TDocument>,
        private config: DocumentDatabaseTableConfig<TDocument, TPartitionKey, TSortKey>,
        private options?: DynamoDbTableOptions
    ) {
        super(type);
    }

    private serialize(object) {
        if (object) {
            for (const key of Object.keys(object)) {
                const value = object[key];
                if (types.isDate(value)) {
                    if (isNaN(value.getTime())) {
                        delete object[key];
                    } else {
                        object[key] = value.toISOString();
                    }
                } else if (typeof value === "object") {
                    object[key] = this.serialize(value);
                }
            }
        }
        return object;
    }

    private deserialize(object) {
        if (object) {
            for (const key of Object.keys(object)) {
                const value = object[key];
                if (Utils.isValidDateString(value)) {
                    object[key] = new Date(value);
                } else if (typeof value === "object") {
                    object[key] = this.deserialize(value);
                }
            }
        }
        return object;
    }

    private async executeScanOrQuery(
        executeScanOrQuery: (() => Promise<DocumentClient.ScanOutput> | Promise<DocumentClient.QueryOutput>),
        params: DocumentClient.ScanInput | DocumentClient.QueryInput,
        pageSize?: number,
        pageNumber?: number
    ): Promise<TDocument[]> {
        const items = [];
        let itemsReturned = 0;
        do
        {
            const data = await executeScanOrQuery();
            
            let itemsToAdd: DocumentClient.ItemList = [];
            if (!pageSize) {
                itemsToAdd.push(...data.Items);
            } else {
                // calculate the start and end index for the page we're looking for
                const startIndex = pageSize * (pageNumber ?? 0);
                const endIndex = startIndex + pageSize;

                for (let i = 0; i < data.Count; i++) {
                    const currentOverallIndex = itemsReturned + i;
                    if (currentOverallIndex >= startIndex && currentOverallIndex < endIndex) {
                        // add the item
                        itemsToAdd.push(data.Items[i]);

                        // if we reached the page size, we can break out now
                        if (items.length + itemsToAdd.length == pageSize) {
                            break;
                        }
                    } 
                }
            }

            params.ExclusiveStartKey = data.LastEvaluatedKey;

            // deserialize and add to master list 
            items.push(...itemsToAdd.map(i => this.deserialize(i.resource)));

            // track the total number of returned items
            itemsReturned += data.Count;
        }
        while (params.ExclusiveStartKey && (!pageSize || items.length < pageSize));

        return items;
    }

    private async executeQuery(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]> {
        try {
            let keyConditionExpression = "#PartitionKey = :partitionKey";
            let expressionAttributeNames = { "#PartitionKey": this.config.partitionKeyName };
            let expressionAttributeValues = { ":partitionKey": query.partitionKey };

            if (query.sortKey) {
                keyConditionExpression += " and #SortKey = :sortKey";
                expressionAttributeNames["#SortKey"] = this.config.sortKeyName;
                expressionAttributeValues[":sorTKey"] = query.sortKey;
            }

            let filterExpression: string;
            if (query.filter) {
                const dynamoDbFilter = new DynamoDbFilter(query.filter);
                dynamoDbFilter.build();
                
                filterExpression = dynamoDbFilter.expression;
                expressionAttributeNames = Object.assign(expressionAttributeNames, dynamoDbFilter.attributeNames);
                expressionAttributeValues = Object.assign(expressionAttributeValues, dynamoDbFilter.attributeValues);
            }

            const params: DocumentClient.QueryInput = {
                TableName: this.tableName,
                KeyConditionExpression: keyConditionExpression,
                FilterExpression: filterExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
                ConsistentRead: this.options?.consistentQuery
            };

            return this.executeScanOrQuery(
                () => this.docClient.query(params).promise(),
                params,
                query.pageSize,
                query.pageNumber
            );
        } catch (error) {
            console.error(error);
        }
    }

    private async executeScan(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]> {
        try {
            const dynamoDbFilter = new DynamoDbFilter(query.filter);
            dynamoDbFilter.build();

            const params: DocumentClient.ScanInput = {
                TableName: this.tableName,
                FilterExpression: dynamoDbFilter.expression,
                ExpressionAttributeNames:  dynamoDbFilter.attributeNames,
                ExpressionAttributeValues: dynamoDbFilter.attributeValues,
                ConsistentRead: this.options?.consistentQuery
            };

            return this.executeScanOrQuery(
                () => this.docClient.scan(params).promise(),
                params,
                query.pageSize,
                query.pageNumber
            );
        } catch (error) {
            console.error(error);
        }
    }

    async query(query: DocumentDatabaseQuery<TDocument, TPartitionKey, TSortKey>): Promise<TDocument[]> {
        if (query.partitionKey) {
            return this.executeQuery(query);
        } else {
            return this.executeScan(query);
        }
    }
    
    async get(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<TDocument> {
        const params: DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: {
                [this.config.partitionKeyName]: partitionKey,
                [this.config.sortKeyName]: sortKey
            },
            ConsistentRead: this.options?.consistentGet
        };

        const data = await this.docClient.get(params).promise();
        
        return data?.Item?.resource ? this.deserialize(data.Item.resource) : null;
    }

    async put(resource: TDocument): Promise<TDocument> {
        resource = this.serialize(resource);

        const params: DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: {
                [this.config.partitionKeyName]: this.config.getPartitionKey(resource),
                [this.config.sortKeyName]: this.config.getSortKey(resource),
                resource
            }
        };
        try {
            await this.docClient.put(params).promise();
        }
        catch (error) {
            throw new McmaException("Failed to put resource in DynamoDB table", error);
        }
        return this.deserialize(resource);
    }

    async delete(partitionKey: TPartitionKey, sortKey: TSortKey): Promise<void> {
        const params: DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                [this.config.partitionKeyName]: partitionKey,
                [this.config.sortKeyName]: sortKey
            }
        };
        try {
            await this.docClient.delete(params).promise();
        }
        catch (error) {
            throw new McmaException("Failed to delete resource in DynamoDB table", error);
        }
    }
}
