//"use strict";

module.exports = require("./lib/mcma-core");

// add default AWS authenticator in core - for now. Should be moved.
module.exports.AwsV4Authenticator = require("./lib/aws-v4");