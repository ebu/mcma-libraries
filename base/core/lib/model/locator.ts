import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface LocatorProperties extends McmaObjectProperties {
    url: string;
}

export abstract class Locator extends McmaObject implements LocatorProperties {
    url: string;

    protected constructor(type: string, properties?: LocatorProperties) {
        super(type, properties);

        Utils.checkProperty(this, "url", "string", true);
    }
}
