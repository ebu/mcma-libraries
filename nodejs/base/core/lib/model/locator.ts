import { McmaObject } from "./mcma-object";

export abstract class Locator extends McmaObject {
    constructor(type: string, properties?: { [key: string]: any }) {
        super(type, properties);
    }
}