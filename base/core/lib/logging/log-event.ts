import { McmaTrackerProperties } from "../model";
import * as util from "util";

export class LogEvent {

    constructor(public type: string,
                public level: number,
                public source: string,
                public requestId: string,
                public timestamp: Date,
                public message: any,
                public tracker?: McmaTrackerProperties) {
    }

    flatten(): { [key: string]: any } {
        const logEventEntry: { [key: string]: any } = {
            type: this.type,
            level: this.level,
            source: this.source,
            requestId: this.requestId,
            timestamp: this.timestamp,
            message: this.message,
            trackerId: this.tracker?.id,
            trackerLabel: this.tracker?.label,
        };

        if (this.tracker?.custom) {
            for (const key of Object.keys(this.tracker?.custom)) {
                const trackerCustomKey = key.substring(0, 1).toUpperCase() + key.substring(1);
                const trackerCustomValue = this.tracker?.custom[key];

                switch (trackerCustomKey) {
                    case "Id":
                    case "Label":
                        logEventEntry["trackerCustom" + trackerCustomKey] = trackerCustomValue;
                        break;
                    default:
                        logEventEntry["tracker" + trackerCustomKey] = trackerCustomValue;
                        break;
                }
            }
        }

        return logEventEntry;
    }

    toString(): string {
        const logEventEntry = this.flatten();
        try {
            return JSON.stringify(logEventEntry, null, 2);
        } catch {
            try {
                logEventEntry.message = util.inspect(logEventEntry.message);
            } catch {
                logEventEntry.message = logEventEntry.message + "";
            }
        }

        return JSON.stringify(logEventEntry, null, 2);
    }
}
