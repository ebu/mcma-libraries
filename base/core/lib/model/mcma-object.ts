export interface McmaObjectProperties {
    ["@type"]?: string;
}

export class McmaObject implements McmaObjectProperties {
    ["@type"]: string;

    constructor(type: string, properties?: McmaObjectProperties) {
        if (properties) {
            Object.assign(this, properties);
        }
        this["@type"] = type;
    }
}
