const util = require('util');

class DynamoDbTable {
    constructor(AWS, tableName) {
        let docClient = new AWS.DynamoDB.DocumentClient();
        const dcQuery = util.promisify(docClient.query.bind(docClient));
        const dcGet = util.promisify(docClient.get.bind(docClient));
        const dcPut = util.promisify(docClient.put.bind(docClient));
        const dcDelete = util.promisify(docClient.delete.bind(docClient));

        this.getAll = async (type) => {
            var params = {
                TableName: tableName,
                KeyConditionExpression: "#rs = :rs1",
                ExpressionAttributeNames: {
                    "#rs": "resource_type"
                },
                ExpressionAttributeValues: {
                    ":rs1": type
                }
            };

            let data = await dcQuery(params);

            let items = [];

            if (data.Items) {
                for (const item of data.Items) {
                    items.push(item.resource);
                }
            }

            return items;
        }

        this.get = async (type, id) => {
            var params = {
                TableName: tableName,
                Key: {
                    "resource_type": type,
                    "resource_id": id,
                }
            };

            let data = await dcGet(params);

            if (!data || !data.Item || !data.Item.resource) {
                return null;
            }
            return data.Item.resource;
        }

        this.put = async (type, id, resource) => {
            var item = {
                "resource_type": type,
                "resource_id": id,
                "resource": resource
            };

            var params = {
                TableName: tableName,
                Item: item
            };

            await dcPut(params);
        }

        this.delete = async (type, id) => {
            var params = {
                TableName: tableName,
                Key: {
                    "resource_type": type,
                    "resource_id": id,
                }
            };

            await dcDelete(params);
        }
    }
}

module.exports = {
    DynamoDbTable: DynamoDbTable
}
