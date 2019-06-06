const uriTemplates = require('uri-templates');

class McmaApiRoute {
    constructor(httpMethod, path, handler) {
        this.httpMethod = httpMethod;
        this.path = path;
        this.template = uriTemplates(path);
        this.handler = handler;
    }
}

class McmaApiRouteCollection {
    constructor(routes) {
        this.routes = [];
        if (routes) {
            this.addRoutes(routes);
        }
    }

    addRoute(methodOrRoute, path, handler) {
        if (typeof methodOrRoute === 'object' && !path && !handler) {
            this.routes.push(methodOrRoute);
        } else if (typeof methodOrRoute === 'string' && typeof path === 'string' && typeof handler === 'function') {
            this.routes.push(new McmaApiRoute(methodOrRoute, path, handler));
        } else {
            throw new Error('Invalid arguments. Must provide either an McmaApiRoute object or an HTTP method, a path, and a handler.');
        }
        return this;
    }

    addRoutes(routes) {
        if (routes && typeof routes[Symbol.iterator] !== 'function') {
            throw new Error('Argument must be an array of routes.');
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

module.exports = {
    McmaApiRoute,
    McmaApiRouteCollection
};