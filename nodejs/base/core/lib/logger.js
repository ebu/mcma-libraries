class ConsoleLogger {
    debug(msg, ...args) {
        console.log(msg, ...args);
    }

    info(msg, ...args) {
        console.log(msg, ...args);
    }

    warn(msg, ...args) {
        console.warn(msg, ...args);
    }

    error(msg, ...args) {
        console.error(msg, ...args);
    }

    exception(error) {
        console.log(error);
    }
}

function Logger() {}
Logger.global = new ConsoleLogger();
Logger.debug = (msg, ...args) => Logger.global.debug(msg, ...args);
Logger.info = (msg, ...args) => Logger.global.info(msg, ...args);
Logger.warn = (msg, ...args) => Logger.global.warn(msg, ...args);
Logger.error = (msg, ...args) => Logger.global.error(msg, ...args);
Logger.exception = (error) => Logger.global.exception(error);

module.exports = {
    Logger
};