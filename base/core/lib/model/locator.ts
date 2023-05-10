import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface LocatorProperties extends McmaObjectProperties {
    url: string;
}

export class Locator extends McmaObject implements LocatorProperties {
    url: string;

    constructor(properties: LocatorProperties);
    constructor(type: string, properties: LocatorProperties);
    constructor(typeOrProperties: string | LocatorProperties, properties?: LocatorProperties) {
        if (!properties && typeof typeOrProperties !== "string") {
            properties = typeOrProperties;
            typeOrProperties = "Locator";
        }
        super(typeOrProperties as string);
        this.url = properties.url;

        Utils.checkProperty(this, "url", "string", true);
    }
}
