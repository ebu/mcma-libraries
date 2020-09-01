import { McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

export class DefaultDeleteRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public onCompleted: (requestContext: McmaApiRequestContext, resource: T) => Promise<void>;
    public handler: (requestContext: McmaApiRequestContext) => Promise<void>;
    
    constructor(
        private dbTableProvider: DocumentDatabaseTableProvider,
        private root: string
    ) {
        super("DELETE", root + "/{id}", requestContext => this.handler(requestContext));
        this.handler = reqCtx => this.defaultHandler(reqCtx);
    }
    
    private async defaultHandler(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }
        const table = await this.dbTableProvider.get(getTableName(requestContext));

        const resource = await table.get<T>(requestContext.request.path);
        if (!resource) {
            requestContext.setResponseResourceNotFound();
            return;
        }
        await table.delete(requestContext.request.path);
        if (this.onCompleted) {
            await this.onCompleted(requestContext, resource);
        }
    }
}
