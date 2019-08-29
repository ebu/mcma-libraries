//"use strict";
const Core = require("./lib/mcma-core");
const { ContextVariableProvider, EnvironmentVariableProvider } = require("./lib/context-variable-provider");
const { Logger } = require("./lib/logger");
const Utils = require("./lib/utils");

module.exports = Object.assign(Core, {
    Logger,
    ContextVariableProvider,
    EnvironmentVariableProvider,
    Utils
});