import { McmaObject, McmaObjectProperties } from "./mcma-object";

export interface McmaResourceProperties extends McmaObjectProperties {
    id?: string;
    dateCreated?: Date | string;
    dateModified?: Date | string;
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

    protected constructor(type: string, properties: McmaResourceProperties) {
        super(type, properties);

        this.dateCreated = this.ensureValidDateOrUndefined(this.dateCreated);
        this.dateModified = this.ensureValidDateOrUndefined(this.dateModified);
    }

    onCreate = (id: string) => onResourceCreate(this, id);
    onUpsert = (id: string) => onResourceUpsert(this, id);
}
