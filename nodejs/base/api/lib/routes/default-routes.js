const uuidv4 = require("uuid/v4");
const { Utils, onResourceCreate, onResourceUpsert } = require("mcma-core");

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
        }

        this.onCompleted = (x) => {
            defaultHandlerBuilder.onCompleted = x;
            return this;
        }
        
        this.build = () => {
            return new McmaApiRoute(httpMethod, path, handler || defaultHandlerBuilder.create());
        }
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
    constructor(dbTableProvider, root) {
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
                        await onStarted(requestContext);
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

                    requestContext.resourceIfFound(resources);
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
                        await onStarted(requestContext);
                    }

                    const resource = requestContext.isBadRequestDueToMissingBody();
                    if (!resource) {
                        return;
                    }

                    onResourceCreate(resource, requestContext.publicUrl() + root + "/" + uuidv4());

                    await dbTableProvider.table(requestContext.tableName()).put(resource.id, resource);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    requestContext.resourceCreated(resource);
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
                        await onStarted(requestContext);
                    }

                    const resource =
                        await dbTableProvider.table(requestContext.tableName()).get(requestContext.publicUrl() + requestContext.request.path);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    requestContext.resourceIfFound(resource);
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
                        await onStarted(requestContext);
                    }

                    const resource = requestContext.isBadRequestDueToMissingBody();
                    if (!resource) {
                        return;
                    }

                    onResourceUpsert(resource, requestContext.publicUrl() + requestContext.request.path);

                    await dbTableProvider.table(requestContext.tableName()).put(resource.id, resource);

                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }

                    requestContext.response.body = resource;
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
                        await onStarted(requestContext);
                    }

                    const table = dbTableProvider.table(requestContext.tableName());

                    const id = requestContext.publicUrl() + requestContext.request.path;

                    const resource = await table.get(id);

                    if (!requestContext.resourceIfFound(resource, false)) {
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

function defaultRoutes(type) {
    type = Utils.getTypeName(type);
    return {
        builder: (getDbTableProvider, root) =>
            new DefaultRouteCollectionBuilder(getDbTableProvider(type), root || pluralizeKebabCase(camelCaseToKebabCase(type)))
    };
}

module.exports = {
    DefaultRouteCollectionBuilder,
    defaultRoutes
};