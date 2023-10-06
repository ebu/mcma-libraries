import { Utils } from "./utils";

export class McmaException extends Error {
    public originalStack: string;

    constructor(public message: string, public cause?: Error, public context?: any) {
        super(message);
        this.cause = cause;
        this.context = context;

        this.originalStack = this.stack;
        this.stack = this.toString(true);
    }

    toString(includeDetails = false): string {
        let ret = "";

        let c: any = this;
        while (c) {
            if (includeDetails && c.originalStack) {
                ret += c.originalStack;
            } else if (includeDetails && c.stack) {
                ret += c.stack;
            } else {
                ret += "Error: " + (c.message ?? c);
            }

            if (includeDetails && c.context) {
                ret += "\nContext:\n" + Utils.stringify(c.context);
            }

            c = c.cause;
            if (c) {
                ret += "\nCaused by:\n";
            }
        }

        return ret;
    }
}

