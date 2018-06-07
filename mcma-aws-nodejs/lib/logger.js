//"use strict";

var loggers = {};

function setLogger(level, logger) {
    switch (level) {
        case "error":
            loggers.error = logger;
            break;
        case "warn":
            loggers.warn = logger;
            break;
        case "log":
            loggers.log = logger;
            break;
    }
}

function error(a,b,c,d,e,f,g,h) {
    if (typeof (loggers.error) === "function") {
        loggers.error(a,b,c,d,e,f,g,h);
    }
}

function warn(a,b,c,d,e,f,g,h) {
    if (typeof (loggers.warn) === "function") {
        loggers.warn(a,b,c,d,e,f,g,h);
    }
}

function log(a,b,c,d,e,f,g,h) {
    if (typeof (loggers.log) === "function") {
        loggers.log(a,b,c,d,e,f,g,h);
    }
}

module.exports = {
    setLogger: setLogger,
    error: error,
    warn: warn,
    log: log
}
