import { McmaException } from "./mcma-exception";

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
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

function ensureValidDateOrUndefined(maybeDate: any): Date | undefined {
    if (maybeDate === undefined || maybeDate === null) {
        return undefined;
    }
    const date = new Date(maybeDate);
    if (isNaN(date.getTime())) {
        return undefined;
    }
    return date;
}

function checkProperty(object: any, propertyName: string, expectedType: string, required?: boolean) {
    const propertyValue = (<any>object)[propertyName];
    const propertyType = typeof propertyValue;

    if (propertyValue === undefined || propertyValue === null) {
        if (required) {
            throw new McmaException("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to be defined", null, object);
        }
        return;
    }

    if (expectedType === "url") {
        if (propertyType !== "string" || !Utils.isValidUrl(propertyValue)) {
            throw new McmaException("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have a valid URL", null, object);
        }
    } else if (expectedType === "Array") {
        if (!Array.isArray(propertyValue)) {
            throw new McmaException("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type Array", null, object);
        }
    } else if (expectedType === "object") {
        if (propertyType !== "object" || Array.isArray(propertyValue)) {
            throw new McmaException("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type object", null, object);
        }
    } else {
        if (expectedType !== propertyType) {
            throw new McmaException("Resource of type '" + object["@type"] + "' requires property '" + propertyName + "' to have type " + expectedType, null, object);
        }
    }
}

export const Utils = {
    isValidUrl,
    getTypeName,
    toBase64,
    fromBase64,
    sleep,
    isValidDateString,
    reviver,
    ensureValidDateOrUndefined,
    checkProperty,
};
