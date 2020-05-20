import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface LocatorProperties extends McmaObjectProperties {
}

export abstract class Locator extends McmaObject implements LocatorProperties {
    protected constructor(type: string, properties?: LocatorProperties) {
        super(type, properties);
    }
}
