//"use strict";

var logger = require("./logger.js");

var _AWS;

var docClient;

const INTERNAL = "###INTERNAL###";

function setAWS(AWS) {
    _AWS = AWS;
}

function getDocClient() {
    if (!docClient) {
        docClient = new _AWS.DynamoDB.DocumentClient();
    }
    return docClient;
}

function parseUrl(event, url, callback) {
    if (url && url.startsWith(event.variables.PublicUrl)) {
        var parts = url.substring(event.variables.PublicUrl.length + 1).split("/");

        switch (parts.length) {
            case 1:
                return callback(null, parts[0]);
            case 2:
                return callback(null, parts[0], parts[1]);
        }
    }

    return callback("Failed to parse parse url '" + url + "'");
}

function replace(object, searchValue, replaceValue) {
    if (!object) {
        return object;
    }

    var ret;

    if (object.constructor === Array) {
        var ret = [];

        object.forEach(item => {
            var type = typeof item;

            switch (type) {
                case "string":
                    ret.push(item.replace(searchValue, replaceValue));
                    break;
                case "object":
                    ret.push(replace(item, searchValue, replaceValue));
                    break;
                default:
                    ret.push(item);
                    break;
            }
        });
    } else {
        var ret = {};

        for (var prop in object) {
            var type = typeof object[prop];

            switch (type) {
                case "string":
                    ret[prop] = object[prop].replace(searchValue, replaceValue);
                    break;
                case "object":
                    ret[prop] = replace(object[prop], searchValue, replaceValue);
                    break;
                default:
                    ret[prop] = object[prop];
                    break;
            }
        }
    }
    return ret;
}

function getAll(event, type, callback) {
    var params = {
        TableName: event.variables.TableName,
        KeyConditionExpression: "#rs = :rs1",
        ExpressionAttributeNames: {
            "#rs": "resource_type"
        },
        ExpressionAttributeValues: {
            ":rs1": type
        }
    };

    getDocClient().query(params, function (err, data) {
        var items = null;
        if (!err) {
            items = [];
            data.Items.forEach(i => {
                items.push(replace(i.resource, INTERNAL, event.variables.PublicUrl));
            });
        }

        callback(err, items);
    });
}

function getSingle(event, type, id, callback) {
    var params = {
        TableName: event.variables.TableName,
        Key: {
            "resource_type": type,
            "resource_id": id,
        }
    };

    getDocClient().get(params, function (err, data) {
        var resource = data && data.Item && data.Item.resource ? data.Item.resource : null;
        if (!resource) {
            logger.error("Empty resource detected");
            logger.error("Error: " + JSON.stringify(err));
            logger.error("Data: " + JSON.stringify(data));
            if (!err) {
                err = "Empty resource detected";
            }
        } else {
            resource = replace(resource, INTERNAL, event.variables.PublicUrl);
        }
        callback(err, resource);
    });
}

function get(event, url, callback) {
    parseUrl(event, url, (err, type, id) => {
        if (err) {
            return callback(err);
        }

        if (id) {
            return getSingle(event, type, id, callback);
        } else {
            return getAll(event, type, callback);
        }
    });
}

function put(event, resource, callback) {
    parseUrl(event, resource.id, (err, type, id) => {
        if (err) {
            return callback(err);
        }

        var item = {
            "resource_type": type,
            "resource_id": id,
            "resource": replace(resource, event.variables.PublicUrl, INTERNAL)
        };

        var params = {
            TableName: event.variables.TableName,
            Item: item
        };

        getDocClient().put(params, function (err, data) {
            callback(err, resource);
        });
    });
}

function del(event, url, callback) {
    parseUrl(event, url, (err, type, id) => {
        if (err) {
            return callback(err);
        }

        var params = {
            TableName: event.variables.TableName,
            Key: {
                "resource_type": type,
                "resource_id": id,
            }
        };

        getDocClient().delete(params, function (err, data) {
            callback(err);
        });
    });
}

module.exports = {
    setAWS: setAWS,
    logger: logger,
    get: get,
    put: put,
    del: del
}