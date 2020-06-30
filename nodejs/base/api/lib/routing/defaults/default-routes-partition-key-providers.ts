import { McmaResource } from "@mcma/core";
import { McmaApiRequestContext } from "../../http";

export interface DefaultRoutesPartitionKeyProviders<T extends McmaResource> {
    query: (requestContext: McmaApiRequestContext) => string;
    create: (requestContext: McmaApiRequestContext, resource: T) => string;
    get: (requestContext: McmaApiRequestContext) => string;
    update: (requestContext: McmaApiRequestContext, resource: T) => string;
    delete: (requestContext: McmaApiRequestContext) => string;
}

export function getConstantPartitionKeyProviders<T extends McmaResource>(partitionKey: string): DefaultRoutesPartitionKeyProviders<T> {
    return {
        query: _ => partitionKey,
        create: (_1, _2) => partitionKey,
        get: _ => partitionKey,
        update: (_1, _2) => partitionKey,
        delete: _ => partitionKey,
    };
}