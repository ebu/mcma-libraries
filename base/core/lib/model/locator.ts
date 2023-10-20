import { McmaResource, McmaResourceProperties } from "./mcma-resource";
import { Utils } from "../utils";
import { LocatorStatus } from "./locator-status";

export interface LocatorProperties extends McmaResourceProperties {
    url: string;
    status?: LocatorStatus;
}

export class Locator extends McmaResource implements LocatorProperties {
    url: string;
    status?: LocatorStatus;

    constructor(properties: LocatorProperties);
    constructor(type: string, properties: LocatorProperties);
    constructor(typeOrProperties: string | LocatorProperties, properties?: LocatorProperties) {
        if (!properties && typeof typeOrProperties !== "string") {
            properties = typeOrProperties;
            typeOrProperties = "Locator";
        }
        super(typeOrProperties as string);
        this.url = properties.url;
        this.status = properties.status;

        Utils.checkProperty(this, "url", "string", true);
        Utils.checkProperty(this, "status", "string", false);
    }
}
