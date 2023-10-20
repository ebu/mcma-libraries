import { McmaObject, McmaObjectProperties } from "./mcma-object";
import { Utils } from "../utils";

export interface McmaResourceProperties extends McmaObjectProperties {
    id?: string;
    dateCreated?: Date | string;
    dateModified?: Date | string;
    custom?: { [key: string]: any };
}

export function onResourceCreate(resource: McmaResourceProperties, id: string) {
    resource.id = id;
    resource.dateModified = resource.dateCreated = new Date();
}

export function onResourceUpsert(resource: McmaResourceProperties, id: string) {
    resource.id = id;
    resource.dateModified = new Date();
    if (!resource.dateCreated) {
        resource.dateCreated = resource.dateModified;
    }
}

export abstract class McmaResource extends McmaObject implements McmaResourceProperties {
    id?: string;
    dateCreated?: Date;
    dateModified?: Date;
    custom?: { [key: string]: any };

    protected constructor(type: string, properties?: McmaResourceProperties) {
        super(type);
        this.id = properties?.id;
        this.dateCreated = Utils.ensureValidDateOrUndefined(properties?.dateCreated);
        this.dateModified = Utils.ensureValidDateOrUndefined(properties?.dateModified);
        if (typeof properties?.custom === "object" && Object.keys(properties?.custom).length > 0) {
            this.custom = Object.assign({}, properties.custom);
        }
    }
}
