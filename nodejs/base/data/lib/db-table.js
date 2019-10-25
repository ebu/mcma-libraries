const { Utils } = require("@mcma/core");

class DbTable {
    constructor(type) {
        this.type = Utils.getTypeName(type);
    }

    async query(filter) {
        return [];
    }

    async get(id) {
        return null;
    }

    async put(id, resource) {
        return resource;
    }

    async delete(id) {
    }
}

module.exports = {
    DbTable
};
