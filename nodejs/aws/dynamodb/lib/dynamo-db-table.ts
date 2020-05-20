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

    private normalize(object: any) {
        if (object) {
            if (Array.isArray(object)) {
                for (let i = object.length - 1; i >= 0; i--) {
                    if (object[i] === "") {
                        object.splice(i, 1);
                    } else if (typeof object[i] === "object") {
                        this.normalize(object[i]);
                    }
                }
            } else if (typeof object === "object") {
                for (const prop in object) {
                    if (object.hasOwnProperty(prop)) {
                        const propValue = object[prop];
                        if (propValue === "") {
                            delete object[prop];
                        } else if (types.isDate(propValue)) {
                            if (isNaN(propValue.getTime())) {
                                delete object[prop];
                            } else {
                                object[prop] = propValue.toISOString();
                            }
                        } else if (typeof propValue === "object") {
                            this.normalize(propValue);
                        }
                    }
                }
            }
        }
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
                        items.push(item.resource);
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
                return data.Item.resource;
            }
        }
        catch (error) {
            console.error(error);
        }
        return null;
    }

    async put(id: string, resource: T): Promise<T> {
        this.normalize(resource);
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
        return resource;
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
