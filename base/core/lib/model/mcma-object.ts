export interface McmaObjectProperties {
    ["@type"]?: string;
}

export class McmaObject implements McmaObjectProperties {
    ["@type"]: string;

    constructor(type: string) {
        this["@type"] = type;
    }
}
