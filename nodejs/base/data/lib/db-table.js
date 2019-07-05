const { Utils } = require("@mcma/core");

class DbTable {
    constructor(type) {
        this.type = Utils.getTypeName(type);
    }
}
DbTable.prototype.query = async function(filter) {};
DbTable.prototype.get = async function(id) {};
DbTable.prototype.put = async function(id, resource) {};
DbTable.prototype.delete = async function(id) {};

module.exports = DbTable;