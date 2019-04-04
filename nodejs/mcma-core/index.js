//"use strict";

module.exports = require("./lib/mcma-core");

// add default AWS authenticator in core - for now. Should be moved.
Object.assign(module.exports, require("./lib/aws-v4"));