import { McmaObject } from "./mcma-object";

export interface McmaResourceProperties {
    id?: string;
    dateCreated?: Date;
    dateModified?: Date;
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
    id: string;
    dateCreated?: Date;
    dateModified?: Date;

    constructor(type: string, properties: McmaResourceProperties) {
        super(type, properties);
    }

    onCreate = (id: string) => onResourceCreate(this, id);
    onUpsert = (id: string) => onResourceUpsert(this, id);
}