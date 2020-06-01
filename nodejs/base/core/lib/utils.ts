import { McmaException } from "./mcma-exception";

const validUrl = new RegExp(
    "^(https?:\\/\\/)?" +                                   // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +    // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" +                         // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +                     // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" +                            // query string
    "(\\#[-a-z\\d_]*)?$", "i"                               // fragment locator
);

function isValidUrl(url: string): boolean {
    return validUrl.test(url);
}

function getTypeName(type: string | object | Function): string {
    if (typeof type === "function") {
        type = type.name;
    } else if (typeof type === "object") {
        type = type.constructor.name;
    } else if (typeof type !== "string") {
        throw new McmaException("Invalid type");
    }
    return type;
}

function toBase64(text: string): string {
    // check for browser function for base64
    if (typeof btoa !== "undefined") {
        return btoa(text);
    }
    
    // check for Node.js Buffer class for converting
    if (typeof Buffer !== "undefined" && typeof Buffer.from !== "undefined") {
        return Buffer.from(text).toString("base64");
    }

    // not sure what platform we're on - throw an error to indicate this is not supported
    throw new McmaException("Unable to convert from plain text to base64 string. Neither the function 'btoa' nor the class 'Buffer' are defined on this platform.");
}

function fromBase64(base64Text: string): string {
    // check for browser function for base64
    if (typeof atob !== "undefined") {
        return atob(base64Text);
    }
    
    // check for Node.js Buffer class for converting
    if (typeof Buffer !== "undefined" && typeof Buffer.from !== "undefined") {
        return Buffer.from(base64Text, "base64").toString();
    }

    // not sure what platform we're on - throw an error to indicate this is not supported
    throw new McmaException("Unable to convert to plain text from base64 string. Neither the function 'atob' nor the class 'Buffer' are defined on this platform.");
}

async function sleep(timeout: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(() => resolve(), timeout));
}

const dateFormat = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))$|^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$|^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/;

function isValidDateString(value: any): boolean {
    return typeof value === "string" && dateFormat.test(value);
}

function reviver(this: any, key: string, value: any): any {
    if (isValidDateString(value)) {
        return new Date(value);
    }

    return value;
}

export const Utils = {
    isValidUrl,
    getTypeName,
    toBase64,
    fromBase64,
    sleep,
    isValidDateString,
    reviver,
};
