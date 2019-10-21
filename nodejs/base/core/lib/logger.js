const util = require("util");

class Logger {
    constructor(source, tracker) {
        this.source = source;
        this.tracker = tracker;
    }

    buildLogEvent(level, message, ...args) {
        const logEvent = {
            trackerId: this.tracker && this.tracker.id || "",
            trackerLabel: this.tracker && this.tracker.label || "",
            source: this.source || "",
            timestamp: Date.now(),
            level: level,
            message: util.format(message, ...args),
        };
        return JSON.stringify(logEvent, null, 2);
    }
}

class ConsoleLogger extends Logger {
    constructor(source, tracker) {
        super(source, tracker);
    }

    debug(msg, ...args) {
        console.log(this.buildLogEvent("DEBUG", msg, ...args));
    }

    info(msg, ...args) {
        console.log(this.buildLogEvent("INFO", msg, ...args));
    }

    warn(msg, ...args) {
        console.warn(this.buildLogEvent("WARN", msg, ...args));
    }

    error(msg, ...args) {
        console.error(this.buildLogEvent("ERROR", msg, ...args));
    }
}

class ConsoleLoggerProvider {
    constructor(source) {
        this.source = source;
    }

    get(tracker) {
        return new ConsoleLogger(this.source, tracker);
    }
}

module.exports = {
    Logger,
    ConsoleLogger,
    ConsoleLoggerProvider,
};
