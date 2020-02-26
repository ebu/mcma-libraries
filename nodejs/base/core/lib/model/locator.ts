import { McmaResourceProperties, McmaResource } from "./mcma-resource";

export interface LocatorProperties extends McmaResourceProperties {

}

export abstract class Locator<T extends LocatorProperties> extends McmaResource implements LocatorProperties {
    constructor(type: string, properties: T) {
        super(type, properties);
    }
}