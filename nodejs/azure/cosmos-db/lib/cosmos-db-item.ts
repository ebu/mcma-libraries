import { McmaResource } from "@mcma/core";

export interface CosmosDbItem<T extends McmaResource> {
    id: string;
    type: string;
    partitionKey: string;
    resource: T;
}

export class CosmosDbItem<T extends McmaResource> {
    constructor()
    constructor(resource: T, partitionKey: string)
    constructor(resource?: T, partitionKey?: string) {
        if (resource) {
            this.id = resource.id;
            this.type = resource["@type"];
            this.partitionKey = partitionKey;
            this.resource = resource;
        }
    }
}