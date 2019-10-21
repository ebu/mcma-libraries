const { Exception } = require("./mcma-core");

function getTypeName(type) {
    if (typeof type === "function") {
        type = type.name;
    } else if (typeof type === "object") {
        type = type.constructor.name;
    } else if (typeof type !== "string") {
        throw new Exception("Invalid type");
    }
    return type;
}

module.exports = {
    getTypeName
};
