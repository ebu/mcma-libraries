import { Utils, McmaResourceType, McmaResource, McmaException } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { camelCaseToKebabCase, pluralizeKebabCase } from "../../strings";
import { McmaApiRouteCollection } from "../route-collection";

import * as routes from "./routes";

import { DefaultRouteConfigurator } from "./default-route-configurator";
import { DefaultRoutes } from "./default-routes";
import { DefaultRouteCollection } from "./default-route-collection";
import { DefaultRouteBuilder } from "./default-route-builder";

export class DefaultRouteCollectionBuilder<T extends McmaResource> {
    private routes: DefaultRouteCollection<T>;

    constructor(
        dbTableProvider: DocumentDatabaseTableProvider,
        resourceType: McmaResourceType<T>,
        root?: string
    ) {
        resourceType = Utils.getTypeName(resourceType);
        if (!resourceType) {
            throw new McmaException("Invalid resource type specified for default routes.");
        }

        root = root || pluralizeKebabCase(camelCaseToKebabCase(resourceType));
        if (root[0] !== "/") {
            root = "/" + root;
        }

        this.routes = new DefaultRouteCollection<T>({
            query: routes.defaultQueryBuilder<T>(dbTableProvider, root),
            create: routes.defaultCreateBuilder<T>(dbTableProvider, root),
            get: routes.defaultGetBuilder<T>(dbTableProvider, root),
            update: routes.defaultUpdateBuilder<T>(dbTableProvider, root),
            delete: routes.defaultDeleteBuilder<T>(dbTableProvider, root)
        });
    }

    build(): McmaApiRouteCollection {
        return new McmaApiRouteCollection(this.routes.included.map(rb => rb.build()));
    }

    addAll(): this {
        this.routes.addAll();
        return this;
    }

    route<TResult>(selectRoute: (defaultRoutes: DefaultRoutes<T>) => DefaultRouteBuilder<TResult>): DefaultRouteConfigurator<T, TResult> {
        const routeBuilder = selectRoute(this.routes);
        if (!routeBuilder) {
            throw new McmaException("Invalid route selection expression");
        }
        return new DefaultRouteConfigurator<T, TResult>(this, this.routes, routeBuilder);
    }
}
