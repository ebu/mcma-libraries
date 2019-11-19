const util = require("util");

class Logger {
    constructor(source, tracker) {
        this.source = source;
        this.tracker = tracker;
    }

    buildLogEvent(timestamp, level, type, msg, ...args) {

        let message;

        if (args.length) {
            if (typeof message === "string") {
                message = util.format(msg, ...args);
            } else {
                message = [];
                message.push(msg);
                message.push(...args);
            }
        } else {
            message = msg;
        }

        const logEvent = {
            trackerId: this.tracker && this.tracker.id || "",
            trackerLabel: this.tracker && this.tracker.label || "",
            source: this.source || "",
            timestamp,
            level,
            type,
            message,
        };
        try {
            return JSON.stringify(logEvent, null, 2);
        } catch {
            try {
                logEvent.message = util.inspect(logEvent.message);
            } catch {
                logEvent.message = logEvent.message + "";
            }
        }

        return JSON.stringify(logEvent, null, 2);
    }

    fatal(msg, ...args) {
        this.log(100, "FATAL", msg, ...args);
    }

    error(msg, ...args) {
        this.log(200, "ERROR", msg, ...args);
    }

    warn(msg, ...args) {
        this.log(300, "WARN", msg, ...args);
    }

    info(msg, ...args) {
        this.log(400, "INFO", msg, ...args);
    }

    debug(msg, ...args) {
        this.log(500, "DEBUG", msg, ...args);
    }

    functionStart(msg, ...args) {
        this.log(450, "FUNCTION_START", msg, ...args);
    }

    functionEnd(msg, ...args) {
        this.log(450, "FUNCTION_END", msg, ...args);
    }

    jobStart(msg, ...args) {
        this.log(400, "JOB_START", msg, ...args);
    }

    jobEnd(msg, ...args) {
        this.log(400, "JOB_END", msg, ...args);
    }
}

class ConsoleLogger extends Logger {
    constructor(source, tracker) {
        super(source, tracker);
    }

    log(level, type, msg, ...args) {
        if (level > 0) {
            if (level <= 200) {
                console.error(this.buildLogEvent(Date.now(), level, type, msg, ...args));
            } else if (level < 400) {
                console.warn(this.buildLogEvent(Date.now(), level, type, msg, ...args));
            } else {
                console.log(this.buildLogEvent(Date.now(), level, type, msg, ...args));
            }
        }
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
