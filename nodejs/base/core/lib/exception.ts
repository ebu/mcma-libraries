export class Exception extends Error {
    constructor(public message: string, public cause?: Exception, public context?: any) {
        super(message);
        this.cause = cause;
        this.context = context;
    }

    toString() {
        let ret = "";

        let c: Exception = this;
        while (c) {
            if (c.stack) {
                ret += c.stack;
            } else {
                ret += "Error: " + (c.message ?? c);
            }

            if (c.context) {
                ret += "\nContext:\n" + JSON.stringify(c.context, null, 2);
            }

            c = c.cause;
            if (c) {
                ret += "\nCaused by:\n";
            }
        }

        return ret;
    }
}