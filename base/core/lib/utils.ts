import { McmaException } from "./mcma-exception";

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

export interface ParsedUrl {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
}

function parseUrl(href: string): ParsedUrl | null {
    const match = href.match(/^(https?:)\/\/(([^:\/?#]*)(?::([0-9]+))?)([\/]?[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href ?? "",
        protocol: match[1] ?? "",
        host: match[2] ?? "",
        hostname: match[3] ?? "",
        port: match[4] ?? "",
        pathname: match[5] ?? "",
        search: match[6] ?? "",
        hash: match[7] ?? ""
    };
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
    parseUrl,
    getTypeName,
    toBase64,
    fromBase64,
    sleep,
    isValidDateString,
    reviver,
};
