import { onResourceUpsert, McmaResource } from "@mcma/core";
import { DocumentDatabaseTableProvider, getTableName } from "@mcma/data";

import { getPublicUrl } from "../../config-variables-ext";
import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

export class DefaultUpdateRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public onCompleted: (requestContext: McmaApiRequestContext, resource: T) => Promise<void>;
    public handler: (requestContext: McmaApiRequestContext) => Promise<void>;
    
    constructor(
        private dbTableProvider: DocumentDatabaseTableProvider,
        private root: string
    ) {
        super("PUT", root + "/{id}", requestContext => this.handler(requestContext));
        this.handler = reqCtx => this.defaultHandler(reqCtx);
    }
    
    private async defaultHandler(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }

        const resource = requestContext.getRequestBody();
        if (!resource) {
            requestContext.setResponseBadRequestDueToMissingBody();
            return;
        }

        onResourceUpsert(resource, getPublicUrl(requestContext.configVariables) + requestContext.request.path);

        const dbTable = await this.dbTableProvider.get(getTableName(requestContext.configVariables));

        await dbTable.put<T>(requestContext.request.path, resource);

        if (this.onCompleted) {
            await this.onCompleted(requestContext, resource);
        }

        requestContext.setResponseBody(resource);
    }
}
