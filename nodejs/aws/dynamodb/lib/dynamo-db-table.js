const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

const { Exception } = require("@mcma/core");
const { DbTable } = require("@mcma/data");

function removeEmptyStrings(object) {
    if (object) {
        if (Array.isArray(object)) {
            for (let i = object.length - 1; i >= 0; i--) {
                if (object[i] === "") {
                    object.splice(i, 1);
                } else if (typeof object[i] === "object") {
                    removeEmptyStrings(object[i]);
                }
            }
        } else if (typeof object === "object") {
            for (const prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] === "") {
                        delete object[prop];
                    } else if (typeof object[prop] === "object") {
                        removeEmptyStrings(object[prop]);
                    }
                }
            }
        }
    }
}

class DynamoDbTable extends DbTable {
    constructor(tableName, type) {
        super(type);
        this.tableName = tableName;
    }

    async query(filter) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: "#rs = :rs1",
            ExpressionAttributeNames: {
                "#rs": "resource_type"
            },
            ExpressionAttributeValues: {
                ":rs1": this.type
            }
        };

        const items = [];

        try {
            const data = await docClient.query(params).promise();

            if (data.Items) {
                for (const item of data.Items) {
                    if (!filter || filter(item.resource)) {
                        items.push(item.resource);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }

        return items;
    }

    async get(id) {
        const params = {
            TableName: this.tableName,
            Key: {
                "resource_type": this.type,
                "resource_id": id,
            }
        };

        try {
            const data = await docClient.get(params).promise();

            if (data && data.Item && data.Item.resource) {
                return data.Item.resource;
            }
        } catch (error) {
            console.error(error);
        }

        return null;
    }

    async put(id, resource) {
        removeEmptyStrings(resource);

        const item = {
            "resource_type": this.type,
            "resource_id": id,
            "resource": resource
        };

        const params = {
            TableName: this.tableName,
            Item: item
        };

        try {
            await docClient.put(params).promise();
        } catch (error) {
            throw new Exception("Failed to put resource in DynamoDB table", error);
        }

        return resource;
    }

    async delete(id) {
        const params = {
            TableName: this.tableName,
            Key: {
                "resource_type": this.type,
                "resource_id": id,
            }
        };

        try {
            await docClient.delete(params).promise();
        } catch (error) {
            throw new Exception("Failed to delete resource in DynamoDB table", error);
        }
    }
}

class DynamoDbTableProvider {
    constructor(type) {
        this.type = type;
    }

    get(tableName) {
        return new DynamoDbTable(tableName, this.type);
    }
}

module.exports = {
    DynamoDbTable,
    DynamoDbTableProvider
};
