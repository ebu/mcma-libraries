import { McmaResource } from "@mcma/core";
import { DefaultRouteBuilderType } from "./default-route-builder-type";
import { DefaultRoutes } from "./default-routes";
import { DefaultRouteBuilder } from "./default-route-builder";

export class DefaultRouteCollection<T extends McmaResource> {
    included: DefaultRouteBuilderType[] = [];
    query: DefaultRouteBuilder<T[]>;
    create: DefaultRouteBuilder<T>;
    get: DefaultRouteBuilder<T>;
    update: DefaultRouteBuilder<T>;
    delete: DefaultRouteBuilder<T>;

    constructor(initialRoutes: DefaultRoutes<T>) {
        this.query = initialRoutes && initialRoutes.query;
        this.create = initialRoutes && initialRoutes.create;
        this.get = initialRoutes && initialRoutes.get;
        this.update = initialRoutes && initialRoutes.update;
        this.delete = initialRoutes && initialRoutes.delete;
    }
    
    addAll(): this {
        this.included.push(this.query, this.create, this.get, this.update, this.delete);
        return this;
    }
}
