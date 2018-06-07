//"use strict";

var async = require("async");
var uuid = require("uuid");
var FIMS = require("../lib/mcma-aws.js");

// setting up AWS to use local DynamoDB instance

FIMS.AWS.config.credentials = new FIMS.AWS.Credentials("", "");
FIMS.AWS.config.region = "us-east-1";
FIMS.AWS.config.endpoint = "http://localhost:8000"

var dynamodb = new FIMS.AWS.DynamoDB({ apiVersion: "2012-08-10" });

describe("A spec testing the repository-layer", () => {
    var tableName = uuid.v4();
    var publicUrl = "http://localhost"

    var event = {
        variables: {
            TableName: tableName,
            PublicUrl: publicUrl
        }
    }

    beforeAll((callback) => {
        console.log("These tests need a DynamoDB instance running on " + FIMS.AWS.config.endpoint + "\n");
        createDynamoDBTable(tableName, callback);
    });

    afterAll((callback) => {
        console.log();
        deleteDynamoDBTable(tableName, callback);
    })

    it("it does a get of a non existing resource", (callback) => {
        FIMS.REP.get(event, publicUrl + "/Resource/" + uuid.v4(), (err, resource) => {
            expect(err).not.toBeNull();
            expect(resource).toBeNull();
            callback();
        })
    });

    var resourceId = uuid.v4();

    var resource = {
        id: publicUrl + "/Resource/" + resourceId,
        type: "Resource",
        label: "A label"
    }

    var resource2 = {
        id: publicUrl + "/Resource/" + resourceId,
        type: "Resource",
        label: "Another label"
    }

    it("it does a put of a new resource", (callback) => {
        FIMS.REP.put(event, resource, (err, res) => {
            expect(err).toBeNull();
            expect(res).toEqual(resource);
            callback();
        })
    });

    it("it does a get of an existing resource and test for equality with the original", (callback) => {
        FIMS.REP.get(event, resource.id, (err, res) => {
            expect(err).toBeNull();
            expect(res).toEqual(resource);
            callback();
        })
    });

    it("it does a get of an existing resource but with a different public url", (callback) => {
        var event = {
            variables: {
                TableName: tableName,
                PublicUrl: "http://remotehost",
            }
        }

        var resId = event.variables.PublicUrl + "/Resource/" + resourceId;

        FIMS.REP.get(event, resId, (err, res) => {
            expect(err).toBeNull();
            expect(res.id).toEqual(resId);
            callback();
        })
    });

    it ("it does a put on top of an existing resource", (callback) => {
        FIMS.REP.put(event, resource2, (err, res) => {
            expect(err).toBeNull();
            expect(res).toEqual(resource2);
            callback();
        })
    });

    it("it does a get of an existing resource and test for equality with the original", (callback) => {
        FIMS.REP.get(event, resource2.id, (err, res) => {
            expect(err).toBeNull();
            expect(res).toEqual(resource2);
            callback();
        })
    });

    it("it does a get of all resource of type Resource", (callback) => {
        FIMS.REP.get(event, publicUrl + "/Resource", (err, res) => {
            expect(err).toBeNull();
            expect(res[0]).toEqual(resource2);
            callback();
        })
    });


    it ("it does a delete of an existing resource", (callback) => {
        FIMS.REP.del(event, resource2.id, (err) => {
            expect(err).toBeNull();
            callback();
        })
    });
    
    it ("it does a delete of a non existing resource", (callback) => {
        FIMS.REP.del(event, resource2.id, (err) => {
            expect(err).toBeNull();
            callback();
        })
    });

    
    it("it does a get of all resource of type Resource", (callback) => {
        FIMS.REP.get(event, publicUrl + "/Resource", (err, res) => {
            expect(err).toBeNull();
            expect(res.length).toBe(0);
            callback();
        })
    });
});


describe("A spec testing the data-access-layer", () => {

});

describe("A spec testing the business-layer", () => {

});

describe("A spec testing the rest-api-layer", () => {

});

function createDynamoDBTable(tableName, callback) {
    async.waterfall([
        function (callback) {
            console.log("Creating table '" + tableName + "'");
            var params = {
                AttributeDefinitions: [
                    {
                        AttributeName: "resource_type",
                        AttributeType: "S"
                    },
                    {
                        AttributeName: "resource_id",
                        AttributeType: "S"
                    }
                ],
                KeySchema: [
                    {
                        AttributeName: "resource_type",
                        KeyType: "HASH"
                    },
                    {
                        AttributeName: "resource_id",
                        KeyType: "RANGE"
                    }
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                },
                TableName: tableName
            };
            dynamodb.createTable(params, function (err, data) {
                dynamoTable = data.TableDescription;
                callback(err)
            });
        }
    ], callback);
}

function deleteDynamoDBTable(tableName, callback) {
    async.waterfall([
        function (callback) {
            dynamodb.listTables(callback);
        },
        function (data, callback) {
            if (data.TableNames.indexOf(tableName) >= 0) {
                console.log("Deleting table '" + tableName + "'");
                var params = {
                    TableName: tableName
                };
                dynamodb.deleteTable(params, function (err, data) {
                    callback(err)
                });
            } else {
                callback();
            }
        }], callback);
}
