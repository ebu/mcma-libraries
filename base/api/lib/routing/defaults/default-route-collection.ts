import { McmaException, McmaResource, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { camelCaseToKebabCase, pluralizeKebabCase } from "../../strings.js";
import { McmaApiRouteCollection } from "../route-collection.js";

import { DefaultQueryRoute } from "./default-query-route.js";
import { DefaultCreateRoute } from "./default-create-route.js";
import { DefaultGetRoute } from "./default-get-route.js";
import { DefaultUpdateRoute } from "./default-update-route.js";
import { DefaultDeleteRoute } from "./default-delete-route.js";

export class DefaultRouteCollection<T extends McmaResource> extends McmaApiRouteCollection {
    public query?: DefaultQueryRoute<T>;
    public create?: DefaultCreateRoute<T>;
    public get?: DefaultGetRoute<T>;
    public update?: DefaultUpdateRoute<T>;
    public delete?: DefaultDeleteRoute<T>;

    constructor(
        dbTableProvider: DocumentDatabaseTableProvider,
        resourceType: McmaResourceType<T>,
        root?: string
    ) {
        super();

        resourceType = Utils.getTypeName(resourceType);
        if (!resourceType) {
            throw new McmaException("Invalid resource type specified for default routes.");
        }

        root = root || pluralizeKebabCase(camelCaseToKebabCase(resourceType));
        if (root[0] !== "/") {
            root = "/" + root;
        }

        this.query = new DefaultQueryRoute<T>(dbTableProvider, root);
        this.create = new DefaultCreateRoute<T>(dbTableProvider, root);
        this.get = new DefaultGetRoute<T>(dbTableProvider, root);
        this.update = new DefaultUpdateRoute<T>(dbTableProvider, root);
        this.delete = new DefaultDeleteRoute<T>(dbTableProvider, root);

        this.addRoutes([
            this.query,
            this.create,
            this.get,
            this.update,
            this.delete
        ]);
    }

    remove(key: "query" | "create" | "get" | "update" | "delete"): void {
        const indexToRemove = this.routes.indexOf(this[key]);
        if (indexToRemove >= 0) {
            this.routes.splice(indexToRemove, 1);
        }
        delete this[key];
    }
}
