const uuidv4 = require("uuid/v4");
const { Utils, onResourceCreate, onResourceUpsert } = require("@mcma/core");

const filters = require("../filters");
const { camelCaseToKebabCase, pluralizeKebabCase } = require("../strings");
const { McmaApiRouteCollection, McmaApiRoute } = require("./route-collection");

class DefaultRouteBuilder {
    constructor(httpMethod, path, defaultHandlerBuilder) {
        let handler = null;
        
        this.overrideHandler = (x) => {
            handler = x;
        };

        this.onStarted = (x) => {
            defaultHandlerBuilder.onStarted = x;
            return this;
        };

        this.onCompleted = (x) => {
            defaultHandlerBuilder.onCompleted = x;
            return this;
        };
        
        this.build = () => {
            return new McmaApiRoute(httpMethod, path, handler || defaultHandlerBuilder.create());
        };
    }
}

class DefaultRoutes {
    constructor(initialRoutes) {
        this.included = [];

        this.query = initialRoutes && initialRoutes.query;
        this.create = initialRoutes && initialRoutes.create;
        this.get = initialRoutes && initialRoutes.get;
        this.update = initialRoutes && initialRoutes.update;
        this.delete = initialRoutes && initialRoutes.delete;

        this.addAll = () => {
            this.included.push(this.query, this.create, this.get, this.update, this.delete);
        };
    }
}

function defaultRouteHandlerBuilder(handlerBuilder) {
    return {
        onStarted: null,
        onCompleted: null,
        create: function () {
            return handlerBuilder(this.onStarted, this.onCompleted);
        }
    };
}

class DefaultRouteCollectionBuilder {
    constructor(dbTableProvider, resourceType, root) {
        resourceType = Utils.getTypeName(resourceType);
        if (!resourceType) {
            throw new Error("Invalid resource type specified for default routes.");
        }

        root = root || pluralizeKebabCase(camelCaseToKebabCase(resourceType));
        if (root[0] !== "/") {
            root = "/" + root;
        }

        const routes = new DefaultRoutes({
            query: defaultQueryBuilder(dbTableProvider, root),
            create: defaultCreateBuilder(dbTableProvider, root),
            get: defaultGetBuilder(dbTableProvider, root),
            update: defaultUpdateBuilder(dbTableProvider, root),
            delete: defaultDeleteBuilder(dbTableProvider, root)
        });

        this.build = () => {
            return new McmaApiRouteCollection(routes.included.map(rb => rb.build()));
        };

        this.addAll = () => {
            routes.addAll();
            return this;
        };

        this.route = (getRoute) => {
            const routeBuilder = getRoute(routes);
            if (!routeBuilder) {
                throw new Error("Invalid route selection expression");
            }

            return {
                configure: (configureRoute) => {
                    if (!routes.included.includes(routeBuilder)) {
                        routes.included.push(routeBuilder);
                    }
                    configureRoute(routeBuilder);
                    return this;
                },
                add: () => {
                    if (!routes.included.includes(routeBuilder)) {
                        routes.included.push(routeBuilder);
                    }
                    return this;
                },
                remove: () => {
                    const index = routes.included.indexOf(routeBuilder);
                    if (index >= 0) {
                        routes.included.splice(index, 1);
                    }
                    return this;
                }
            }
        } 
    }
}

function defaultQueryBuilder(dbTableProvider, root) {
    return new DefaultRouteBuilder(
        "GET",
        root,
        defaultRouteHandlerBuilder(
            (onStarted, onCompleted) => {
                return async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    var filter = 
                        requestContext.request.queryStringParameters && Object.keys(requestContext.request.queryStringParameters).length > 0
                            ? filters.inMemoryTextValues(requestContext.request.queryStringParameters)
                            : null;

                    var resources =
                        await dbTableProvider.table(requestContext.tableName()).query(filter);

                    if (onCompleted) {
                        await onCompleted(requestContext, resources);
                    }

                    requestContext.setResponseBody(resources);
                }
            }
        )
    );
}

function defaultCreateBuilder(dbTableProvider, root) {
    return new DefaultRouteBuilder(
        "POST",
        root,
        defaultRouteHandlerBuilder(
            (onStarted, onCompleted) => {
                return async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    const resource = requestContext.getRequestBody();
                    if (!resource) {
                        requestContext.setResponseBadRequestDueToMissingBody();
                        return;
                    }

                    onResourceCreate(resource, requestContext.publicUrl() + root + "/" + uuidv4());

                    await dbTableProvider.table(requestContext.tableName()).put(resource.id, resource);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    requestContext.setResponseResourceCreated(resource);
                }
            }
        )
    );
}

function defaultGetBuilder(dbTableProvider, root) {
    return new DefaultRouteBuilder(
        "GET",
        root + "/{id}",
        defaultRouteHandlerBuilder(
            (onStarted, onCompleted) => {
                return async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    const resource =
                        await dbTableProvider.table(requestContext.tableName()).get(requestContext.publicUrl() + requestContext.request.path);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    if (resource) {
                        requestContext.setResponseBody(resource);
                    } else {
                        requestContext.setResponseResourceNotFound();
                    }
                }
            }
        )
    );
}

function defaultUpdateBuilder(dbTableProvider, root) {
    return new DefaultRouteBuilder(
        "PUT",
        root + "/{id}",
        defaultRouteHandlerBuilder(
            (onStarted, onCompleted) => {
               return async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    const resource = requestContext.getRequestBody();
                    if (!resource) {
                        requestContext.setResponseBadRequestDueToMissingBody();
                        return;
                    }

                    onResourceUpsert(resource, requestContext.publicUrl() + requestContext.request.path);

                    await dbTableProvider.table(requestContext.tableName()).put(resource.id, resource);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    requestContext.setResponseBody(resource);
                }
            }
        )
    );
}

function defaultDeleteBuilder(dbTableProvider, root) {
    return new DefaultRouteBuilder(
        "DELETE",
        root + "/{id}",
        defaultRouteHandlerBuilder(
            (onStarted, onCompleted) => {
                return async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    const table = dbTableProvider.table(requestContext.tableName());

                    const id = requestContext.publicUrl() + requestContext.request.path;

                    const resource = await table.get(id);

                    if (!resource) {
                        requestContext.setResponseResourceNotFound();
                        return;
                    }

                    await table.delete(id);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }
                }
            }
        )
    );
}

module.exports = {
    DefaultRouteCollectionBuilder
};