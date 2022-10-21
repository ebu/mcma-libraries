import { McmaException, McmaResource, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { camelCaseToKebabCase, pluralizeKebabCase } from "../../strings";
import { McmaApiRouteCollection } from "../route-collection";

import { DefaultQueryRoute } from "./default-query-route";
import { DefaultCreateRoute } from "./default-create-route";
import { DefaultGetRoute } from "./default-get-route";
import { DefaultUpdateRoute } from "./default-update-route";
import { DefaultDeleteRoute } from "./default-delete-route";

export class DefaultRouteCollection<T extends McmaResource> extends McmaApiRouteCollection {
    public query: DefaultQueryRoute<T>;
    public create: DefaultCreateRoute<T>;
    public get: DefaultGetRoute<T>;
    public update: DefaultUpdateRoute<T>;
    public delete: DefaultDeleteRoute<T>;

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
        switch (key) {
            case "query":
                this.query = null;
                break;
            case "create":
                this.create = null;
                break;
            case "get":
                this.get = null;
                break;
            case "update":
                this.update = null;
                break;
            case "delete":
                this.delete = null;
                break;
        }
    }
}