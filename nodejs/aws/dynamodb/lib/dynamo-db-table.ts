import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { McmaResource, McmaException, McmaResourceType } from "@mcma/core";
import { DbTable } from "@mcma/data";
import { types } from "util";

export interface DynamoDbTableOptions {
    ConsistentGet?: boolean
    ConsistentQuery?: boolean
}

export class DynamoDbTable<T extends McmaResource> extends DbTable<T> {
    private docClient = new DocumentClient();

    constructor(private tableName: string, type: McmaResourceType<T>, private options?: DynamoDbTableOptions) {
        super(type);
    }

    private serialize<T extends any>(object: T): T {
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

    private readonly dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

    private deserialize<T extends any>(object: T): T {
        if (object) {
            for (const key of Object.keys(object)) {
                const value = object[key];
                if (typeof value === "string" && this.dateFormat.test(value)) {
                    object[key] = new Date(value);
                } else if (typeof value === "object") {
                    object[key] = this.deserialize(value);
                }
            }
        }
        return object;
    }

    async query(filter: (resource: T) => boolean): Promise<T[]> {
        const params: DocumentClient.QueryInput= {
            TableName: this.tableName,
            KeyConditionExpression: "#rs = :rs1",
            ExpressionAttributeNames: {
                "#rs": "resource_type"
            },
            ExpressionAttributeValues: {
                ":rs1": this.type
            },
            ConsistentRead: this.options?.ConsistentQuery
        };
        const items = [];
        try {
            const data = await this.docClient.query(params).promise();
            if (data.Items) {
                for (const item of data.Items) {
                    if (!filter || filter(item.resource)) {
                        items.push(this.deserialize(item.resource));
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
        return items;
    }
    
    async get(id: string): Promise<T> {
        const params: DocumentClient.GetItemInput = {
            TableName: this.tableName,
            Key: {
                "resource_type": this.type,
                "resource_id": id,
            },
            ConsistentRead: this.options?.ConsistentGet
        };
        try {
            const data = await this.docClient.get(params).promise();
            if (data?.Item?.resource) {
                return this.deserialize(data.Item.resource);
            }
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }

    async put(id: string, resource: T): Promise<T> {
        resource = this.serialize(resource);

        const params: DocumentClient.PutItemInput = {
            TableName: this.tableName,
            Item: {
                "resource_type": this.type,
                "resource_id": id,
                "resource": resource
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

    async delete(id: string): Promise<void> {
        const params: DocumentClient.DeleteItemInput = {
            TableName: this.tableName,
            Key: {
                "resource_type": this.type,
                "resource_id": id,
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
