import { McmaApiRoute } from "./route";
import { McmaApiRouteHandler } from "./route-handler";
import { McmaException } from "@mcma/core";

export class McmaApiRouteCollection {
    private routes: McmaApiRoute[] = [];

    constructor(routes?: McmaApiRoute[]) {
        if (routes) {
            this.addRoutes(routes);
        }
    }

    addRoute(methodOrRoute: string | McmaApiRoute, path?: string, handler?: McmaApiRouteHandler): McmaApiRouteCollection {
        if (typeof methodOrRoute === "object" && !path && !handler) {
            this.routes.push(methodOrRoute);
        } else if (typeof methodOrRoute === "string" && typeof path === "string" && typeof handler === "function") {
            this.routes.push(new McmaApiRoute(methodOrRoute, path, handler));
        } else {
            throw new McmaException("Invalid arguments. Must provide either an McmaApiRoute object or an HTTP method, a path, and a handler.");
        }
        return this;
    }

    addRoutes(routes: McmaApiRouteCollection | McmaApiRoute[]): McmaApiRouteCollection {
        if (routes && typeof routes[Symbol.iterator] !== "function") {
            throw new McmaException("Argument must be an array of routes.");
        }
        for (let route of routes) {
            this.addRoute(route);
        }
        return this;
    }

    [Symbol.iterator]() {
        return this.routes[Symbol.iterator]();
    }
}
