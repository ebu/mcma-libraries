import { v4 as uuidv4 } from "uuid";
import { onResourceCreate, McmaResource } from "@mcma/core";
import { DocumentDatabaseTableProvider, getTableName } from "@mcma/data";

import { getPublicUrl } from "../../config-variables-ext";
import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

export class DefaultCreateRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public onCompleted: (requestContext: McmaApiRequestContext, resource: T) => Promise<void>;
    public handler: (requestContext: McmaApiRequestContext) => Promise<void>;
    
    constructor(
        private readonly dbTableProvider: DocumentDatabaseTableProvider,
        private readonly root: string
    ) {
        super("POST", root, requestContext => this.handler(requestContext));
        this.handler = reqCtx => this.defaultHandler(reqCtx);
    }
    
    private async defaultHandler(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }

        const resource = requestContext.getRequestBody<T>();
        if (!resource) {
            requestContext.setResponseBadRequestDueToMissingBody();
            return;
        }

        const resourcePath = this.root + "/" + uuidv4();

        onResourceCreate(resource, getPublicUrl(requestContext.configVariables) + resourcePath);

        const dbTable = await this.dbTableProvider.get(getTableName(requestContext.configVariables));

        await dbTable.put<T>(resourcePath, resource);

        if (this.onCompleted) {
            await this.onCompleted(requestContext, resource);
        }

        requestContext.setResponseResourceCreated(resource);
    }
}
