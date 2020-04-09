import { McmaTrackerProperties } from "../model/mcma-tracker";
import { LogEvent } from "./log-event";

export interface Logger {
    debug(message: string, ...args: any[]): void;
    debug(...args: any[]): void;
    
    info(message: string, ...args: any[]): void;
    info(...args: any[]): void;
    
    warn(message: string, ...args: any[]): void;
    warn(...args: any[]): void;
    
    error(message: string, ...args: any[]): void;
    error(...args: any[]): void;

    fatal(message: string, ...args: any[]): void;
    fatal(...args: any[]): void;

    functionStart(message: string, ...args: any[]): void;
    functionEnd(message: string, ...args: any[]): void;

    jobStart(message: string, ...args: any[]): void;
    jobEnd(message: string, ...args: any[]): void;
}

export abstract class Logger implements Logger {
    private _source: string;
    private _tracker: McmaTrackerProperties;

    constructor(source: string, tracker?: McmaTrackerProperties) {
        this._source = source;
        this._tracker = tracker;
    }

    protected get source(): string { return this._source; }
    protected get tracker(): McmaTrackerProperties { return this._tracker; }

    static System: Logger;

    protected buildLogEvent(level: number, type: string, messageOrFirstArg: string | any, ...args: any[]): LogEvent {
        const timestamp = new Date();

        let message: string = null;
        if (typeof messageOrFirstArg === "string") {
            message = messageOrFirstArg;
        } else {
            args.unshift(messageOrFirstArg);
        }

        return {
            trackerId: this.tracker && this.tracker.id || "",
            trackerLabel: this.tracker && this.tracker.label || "",
            source: this.source || "",
            timestamp,
            level,
            type,
            message,
            args
        };
    }

    fatal(msg: string | any[], ...args: any[]): void {
        this.log(this.buildLogEvent(100, "FATAL", msg, ...args));
    }

    error(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(200, "ERROR", msg, ...args));
    }

    warn(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(300, "WARN", msg, ...args));
    }

    info(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(400, "INFO", msg, ...args));
    }

    debug(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(500, "DEBUG", msg, ...args));
    }

    functionStart(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(450, "FUNCTION_START", msg, ...args));
    }

    functionEnd(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(450, "FUNCTION_END", msg, ...args));
    }

    jobStart(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(400, "JOB_START", msg, ...args));
    }

    jobEnd(msg: string | any, ...args: any[]): void {
        this.log(this.buildLogEvent(400, "JOB_END", msg, ...args));
    }

    abstract log(logEvent: LogEvent): void;
}