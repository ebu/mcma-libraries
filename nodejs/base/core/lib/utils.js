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

function toBase64(text) {
    // check for browser function for base64
    if (typeof btoa !== "undefined") {
        return btoa(text);
    }
    
    // check for Node.js Buffer class for converting
    if (typeof Buffer !== "undefined" && typeof Buffer.from !== "undefined") {
        return Buffer.from(text).toString("base64");
    }

    // not sure what platform we're on - throw an error to indicate this is not supported
    throw new Exception("Unable to convert from plain text to base64 string. Neither the function 'btoa' nor the class 'Buffer' are defined on this platform.");
}

function fromBase64(base64Text) {
    // check for browser function for base64
    if (typeof atob !== "undefined") {
        return atob(base64Text);
    }
    
    // check for Node.js Buffer class for converting
    if (typeof Buffer !== "undefined" && typeof Buffer.from !== "undefined") {
        return Buffer.from(base64Text, "base64").toString();
    }

    // not sure what platform we're on - throw an error to indicate this is not supported
    throw new Exception("Unable to convert to plain text from base64 string. Neither the function 'atob' nor the class 'Buffer' are defined on this platform.");
}

module.exports = {
    getTypeName,
    toBase64,
    fromBase64
};
