import * as util from "util";

import { v4 as uuidv4 } from "uuid";

import { McmaTrackerProperties } from "../model";
import { LogEvent } from "./log-event";

export interface Logger {
    debug(message: any, ...optionalParams: any[]): void;
    info(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    fatal(message: any, ...optionalParams: any[]): void;

    functionStart(message: any, ...optionalParams: any[]): void;
    functionEnd(message: any, ...optionalParams: any[]): void;

    jobStart(message: any, ...optionalParams: any[]): void;
    jobUpdate(message: any, ...optionalParams: any[]): void;
    jobEnd(message: any, ...optionalParams: any[]): void;
}

export abstract class Logger implements Logger {
    private readonly _source: string;
    private readonly _requestId: string;
    private readonly _tracker?: McmaTrackerProperties;

    protected constructor(source: string, requestId?: string, tracker?: McmaTrackerProperties) {
        this._source = source;
        this._requestId = requestId ?? uuidv4();
        this._tracker = tracker;
    }

    protected get source(): string {
        return this._source;
    }
    protected get requestId(): string {
        return this._requestId;
    }
    protected get tracker(): McmaTrackerProperties {
        return this._tracker;
    }

    static System: Logger;

    protected buildLogEvent(level: number, type: string, message: any, ...optionalParams: any[]): LogEvent {
        if (optionalParams.length) {
            if (typeof message === "string") {
                message = util.format(message, ...optionalParams);
            } else {
                message = [message, ...optionalParams];
            }
        }

        return new LogEvent(type, level, this.source, this.requestId, new Date(), message, this.tracker);
    }

    fatal(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(100, "FATAL", message, ...optionalParams));
    }

    error(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(200, "ERROR", message, ...optionalParams));
    }

    warn(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(300, "WARN", message, ...optionalParams));
    }

    info(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(400, "INFO", message, ...optionalParams));
    }

    debug(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(500, "DEBUG", message, ...optionalParams));
    }

    functionStart(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(450, "FUNCTION_START", message, ...optionalParams));
    }

    functionEnd(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(450, "FUNCTION_END", message, ...optionalParams));
    }

    jobStart(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(400, "JOB_START", message, ...optionalParams));
    }

    jobUpdate(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(400, "JOB_UPDATE", message, ...optionalParams));
    }

    jobEnd(message: any, ...optionalParams: any[]): void {
        this.log(this.buildLogEvent(400, "JOB_END", message, ...optionalParams));
    }

    abstract log(logEvent: LogEvent): void;
}
