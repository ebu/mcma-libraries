//"use strict";

var uuid = require("uuid");

var logger = require("./logger.js");

var _DAL;

function setDAL(DAL) {
    _DAL = DAL;
}

function accepts(event, resourceDescriptor, callback)
{
    return callback("Not Found");
}

function get(event, resourceDescriptor, callback) {
    _DAL.get(event, resourceDescriptor.url, callback);
}

function post(event, resourceDescriptor, resource, callback) {
    if (!resource.id) {
        resource.id = event.variables.PublicUrl + "/" + resourceDescriptor.type + "/" + uuid.v4();
    }

    if (!resource.dateCreated) {
        resource.dateCreated = new Date().toISOString();
        resource.dateModified = resource.dateCreated;
    } else {
        resource.dateModified = new Date().toISOString();
    }

    _DAL.post(event, resourceDescriptor.url, resource, callback);
}

function put(event, resourceDescriptor, resource, callback) {
    resource.dateModified = new Date().toISOString();

    _DAL.put(event, resourceDescriptor.url, resource, callback);
}

function del(event, resourceDescriptor, callback) {
    _DAL.del(event, resourceDescriptor.url, callback);
}

module.exports = {
    setDAL: setDAL,
    logger: logger,
    accepts: accepts,
    get: get,
    post: post,
    put: put,
    del: del
}
