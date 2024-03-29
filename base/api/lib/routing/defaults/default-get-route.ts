import { McmaResource } from "@mcma/core";
import { DocumentDatabaseTableProvider, getTableName } from "@mcma/data";

import { McmaApiRequestContext } from "../../http";
import { McmaApiRoute } from "../route";

export class DefaultGetRoute<T extends McmaResource> extends McmaApiRoute {
    public onStarted: (requestContext: McmaApiRequestContext) => Promise<boolean>;
    public onCompleted: (requestContext: McmaApiRequestContext, resource: T) => Promise<void>;

    constructor(
        private dbTableProvider: DocumentDatabaseTableProvider,
        private root: string
    ) {
        super("GET", root + "/{id}", requestContext => this.defaultHandler(requestContext));
    }
    
    private async defaultHandler(requestContext: McmaApiRequestContext): Promise<void> {
        if (this.onStarted) {
            const continueRequest = await this.onStarted(requestContext);
            if (continueRequest !== undefined && !continueRequest) {
                return;
            }
        }

        const dbTable = await this.dbTableProvider.get(getTableName(requestContext.configVariables));

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
