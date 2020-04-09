import { McmaObject } from "./mcma-object";

export interface LocatorProperties {

}

export abstract class Locator extends McmaObject implements LocatorProperties {
    constructor(type: string, properties?: { [key: string]: any }) {
        super(type, properties);
    }
}