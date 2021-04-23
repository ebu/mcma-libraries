import { EOL } from "os";

export class McmaException extends Error {
    constructor(public message: string, public cause?: McmaException, public context?: any) {
        super(message);
        this.cause = cause;
        this.context = context;

        this.stack = this.toString(true);
    }

    toString(includeDetails = false): string {
        let ret = "";

        let c: McmaException = this;
        while (c) {
            if (includeDetails && c.stack) {
                ret += c.stack;
            } else {
                ret += "Error: " + (c.message ?? c);
            }

            if (includeDetails && c.context) {
                ret += EOL + "Context:" + EOL + JSON.stringify(c.context, null, 2);
            }

            c = c.cause;
            if (c) {
                ret += EOL + "Caused by: " + EOL;
            }
        }

        return ret;
    }
}