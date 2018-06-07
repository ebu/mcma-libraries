//"use strict";

var async = require("async");

var logger = require("./logger.js");

var _CORE;
var _BL;

function setCORE(CORE) {
    _CORE = CORE;
}

function setBL(BL) {
    _BL = BL;
}

function handler(event, context, callback) {

    logger.log("Received event:", JSON.stringify(event, null, 2));

    const done = function (statusCode, body, additionalHeaders) {
        var headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }

        if (additionalHeaders) {
            for (var prop in additionalHeaders) {
                headers[prop] = additionalHeaders[prop];
            }
        }

        var result = {
            statusCode: statusCode,
            body: body,
            headers: headers
        };

        logger.log("Sending result:", JSON.stringify(result, null, 2));

        result.body = JSON.stringify(result.body, null, 2);

        return callback(null, result);
    };

    var resourceDescriptor = parseResourceUrl(event);

    if (event.httpMethod === "GET" && resourceDescriptor.type === "context" && resourceDescriptor.id === "default") {
        return done(200, _CORE.getDefaultContext());
    }

    if (resourceDescriptor.error) {
        return done(404);
    }

    var internalEvent = {
        variables: event.stageVariables
    }

    return _BL.accepts(internalEvent, resourceDescriptor, (err) => {
        if (err) {
            return done(404, { error: err });
        }

        return processResource(internalEvent, event.body, function (err, resource) {
            if (err) {
                return done(400);
            } else {
                if (resource) {
                    if (resourceDescriptor.id && resourceDescriptor.url !== resource.id) {
                        return done(400, { error: "Resource ID does not match ID in payload ('" + resourceDescriptor.id + "' != '" + resource.id + "')" });
                    }
                }

                switch (event.httpMethod) {
                    case "GET":
                        return handleGet(internalEvent, resourceDescriptor, done);
                    case "POST":
                        return handlePost(internalEvent, resourceDescriptor, resource, done);
                    case "PUT":
                        return handlePut(internalEvent, resourceDescriptor, resource, done);
                    case "DELETE":
                        return handleDelete(internalEvent, resourceDescriptor, done);
                    default:
                        return done(501);
                }

            }
        });
    });
};

function parseResourceUrl(event) {
    var parts = event.path.split("/", 4);

    var result = {
        type: undefined,
        id: undefined
    };

    switch (parts.length) {
        case 4:
            result.error = true;
        case 3:
            result.id = parts[2];
        case 2:
            result.type = parts[1];
    }

    result.url = event.stageVariables.PublicUrl + event.path;

    return result;
}

function handleGet(event, resourceDescriptor, done) {
    if (resourceDescriptor.id) {
        _BL.get(event, resourceDescriptor, function (err, resource) {
            if (err) {
                logger.error("Unable to GET '" + resourceDescriptor.url + "'. Error JSON:", JSON.stringify(err, null, 2));
                return done(404);
            } else {
                renderResource(event, resource, function (err, resource) {
                    if (err) {
                        return done(400, { error: "Failed to render response" })
                    } else {
                        return done(200, resource);
                    }
                });
            }
        });
    } else {
        _BL.get(event, resourceDescriptor, function (err, resource) {
            if (err) {
                logger.error("Unable to GET '" + resourceDescriptor.url + "'. Error:", JSON.stringify(err, null, 2));
                return done(404);
            } else {
                async.map(resource, function (resource, callback) {
                    renderResource(event, resource, callback);
                }, function (err, results) {
                    if (err) {
                        return done(400, { error: "Failed to render response" })
                    } else {
                        return done(200, results);
                    }
                });
            }
        });
    }
}

function handlePost(event, resourceDescriptor, resource, done) {
    if (resourceDescriptor.id) {
        _BL.get(event, resourceDescriptor, function (err, resource) {
            if (err) {
                return done(404);
            } else {
                return done(409);
            }
        });
    } else {
        async.waterfall([
            function (callback) {
                _BL.post(event, resourceDescriptor, resource, function (err, resource) {
                    if (err) {
                        logger.error("Unable to POST to '" + resourceDescriptor.url + "'. Error:", JSON.stringify(err, null, 2));
                        return done(400);
                    } else {
                        renderResource(event, resource, function (err, resource) {
                            if (err) {
                                return done(400, { error: "Failed to render response" })
                            } else {
                                return done(201, resource, { Location: resource.id });
                            }
                        });
                    }
                });
            }
        ], function (err) {
            return done(500);
        });
    }
}

function handlePut(event, resourceDescriptor, resource, done) {
    if (resourceDescriptor.id) {
        _BL.get(event, resourceDescriptor, function (err, data) {
            if (err) {
                return done(404);
            } else {
                _BL.put(event, resourceDescriptor, resource, function (err, resource) {
                    if (err) {
                        logger.error("Unable to PUT to '" + resourceDescriptor.url + "'. Error JSON:", JSON.stringify(err, null, 2));
                        return done(400);
                    } else {
                        renderResource(event, resource, function (err, resource) {
                            if (err) {
                                return done(400, { error: "Failed to render response" })
                            } else {
                                return done(200, resource);
                            }
                        });
                    }
                });
            }
        });
    } else {
        return done(404);
    }
}

function handleDelete(event, resourceDescriptor, done) {
    if (resourceDescriptor.id) {
        _BL.get(event, resourceDescriptor, function (err, resource) {
            if (err) {
                return done(404);
            } else {
                _BL.del(event, resourceDescriptor, function (err, resource) {
                    if (err) {
                        logger.error("Unable to DELETE '" + resourceDescriptor.url + "'. Error JSON:", JSON.stringify(err, null, 2));
                        return done(500);
                    } else {
                        renderResource(event, resource, function (err, resource) {
                            if (err) {
                                return done(400, { error: "Failed to render response" })
                            } else {
                                return done(200, resource);
                            }
                        });
                    }
                });
            }
        });
    } else {
        return done(404);
    }
}

function processResource(event, input, callback) {
    if (input) {
        var resource = JSON.parse(input);

        var contextURL = event.variables.PublicUrl + "/context/default";

        _CORE.putContext(contextURL, _CORE.getDefaultContext());
        _CORE.setDefaultContextURL(contextURL);
        _CORE.compact(resource, contextURL, function (err, resource) {
            if (err) {
                logger.error(JSON.stringify(err, null, 2));
            }
            return callback(err, resource);
        });
    } else {
        return callback();
    }
}

function renderResource(event, resource, callback) {
    if (resource) {
        if (event.queryStringParameters && event.queryStringParameters.context) {
            _CORE.compact(resource, event.queryStringParameters.context, function (err, resource) {
                if (err) {
                    logger.error(JSON.stringify(err, null, 2));
                }

                return callback(err, resource);
            });
        } else {
            return callback(null, resource);
        }
    } else {
        return callback();
    }
}

module.exports = {
    setCORE: setCORE,
    setBL: setBL,
    logger: logger,
    handler: handler
}
