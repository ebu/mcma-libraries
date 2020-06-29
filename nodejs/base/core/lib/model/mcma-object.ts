import { McmaException } from "../mcma-exception";
import { Utils } from "../utils";

export interface McmaObjectProperties {
    ["@type"]?: string;

    [key: string]: any;
}

export class McmaObject implements McmaObjectProperties {
    ["@type"]: string;
    
    [key: string]: any;

    constructor(type: string, properties?: McmaObjectProperties) {
        this["@type"] = type;

        if (properties) {
            Object.assign(this, properties);
        }
    }

    protected checkProperty(propertyName: string, expectedType: string, required?: boolean) {
        const propertyValue = this[propertyName];
        const propertyType = typeof propertyValue;

        if (propertyValue === undefined || propertyValue === null) {
            if (required) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to be defined", null, this);
            }
            return;
        }

        if (expectedType === "url") {
            if (propertyType !== "string" || !Utils.isValidUrl(propertyValue)) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to have a valid URL", null, this);
            }
        } else if (expectedType === "Array") {
            if (!Array.isArray(propertyValue)) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to have type Array", null, this);
            }
        } else if (expectedType === "object") {
            if (propertyType !== "object" || Array.isArray(propertyValue)) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to have type object", null, this);
            }
        } else {
            if (expectedType !== propertyType) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to have type " + expectedType, null, this);
            }
        }
    }

    protected ensureValidDateOrUndefined(maybeDate: any) {
        if (maybeDate === undefined || maybeDate === null) {
            return undefined;
        }
        const date = new Date(maybeDate);
        if (isNaN(date.getTime())) {
            return undefined;
        }
        return date;
    }
}
