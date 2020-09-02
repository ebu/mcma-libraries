import { McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

export class DefaultGetRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public onCompleted: (requestContext: McmaApiRequestContext, resource: T) => Promise<void>;
    public handler: (requestContext: McmaApiRequestContext) => Promise<void>;

    constructor(
        private dbTableProvider: DocumentDatabaseTableProvider,
        private root: string
    ) {
        super("GET", root + "/{id}", requestContext => this.handler(requestContext));
        this.handler = reqCtx => this.defaultHandler(reqCtx);
    }
    
    private async defaultHandler(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }

        const dbTable = await this.dbTableProvider.get(getTableName(requestContext));

        const resource = await dbTable.get<T>(requestContext.request.path);
        if (this.onCompleted) {
            await this.onCompleted(requestContext, resource);
        }

        if (resource) {
            requestContext.setResponseBody(resource);
        } else {
            requestContext.setResponseResourceNotFound();
        }
    }
}
