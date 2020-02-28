import { McmaException } from "../mcma-exception";
import { Utils } from "../utils";

export class McmaObject {
    constructor(type: string, properties?: { [key: string]: any }) {
        this["@type"] = type;

        if (properties) {
            for (const prop in properties) {
                if (properties.hasOwnProperty(prop) && prop !== "@type") {
                    this[prop] = properties[prop];
                }
            }
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
    
        if (expectedType === "resource") { // special MCMA type that can either be a URL referencing a resource or embedded object
            if ((propertyType !== "string" && propertyType !== "object") ||
                (propertyType === "string" && !Utils.isValidUrl(propertyValue)) ||
                (propertyType === "object" && Array.isArray(propertyValue))) {
                throw new McmaException("Resource of type '" + this["@type"] + "' requires property '" + propertyName + "' to have a valid URL or an object", null, this);
            }
        } else if (expectedType === "url") {
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
}
