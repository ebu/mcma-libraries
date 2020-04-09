import { McmaResource } from "@mcma/core";

import { DefaultRouteBuilder } from "./default-route-builder";

export interface DefaultRoutes<T extends McmaResource> {
    query: DefaultRouteBuilder<T[]>;
    create: DefaultRouteBuilder<T>;
    get: DefaultRouteBuilder<T>;
    update: DefaultRouteBuilder<T>;
    delete: DefaultRouteBuilder<T>;
}


