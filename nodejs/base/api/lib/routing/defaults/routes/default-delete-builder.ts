import { McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";
import { McmaApiRequestContext } from "../../../http/mcma-api-request-context";

export function defaultDeleteBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string,
    partitionKeyProvider: ((requestContext: McmaApiRequestContext) => string)
): DefaultRouteBuilder<T> {
    return new DefaultRouteBuilder<T>(
        "DELETE",
        root + "/{id}",
        new DefaultRouteHandlerConfigurator<T>((onStarted, onCompleted) =>
            async (requestContext) => {
                if (onStarted) {
                    const continueRequest = await onStarted(requestContext);
                    if (continueRequest !== undefined && !continueRequest) {
                        return;
                    }
                }
                const table = await dbTableProvider.get(getTableName(requestContext));
                const id = getPublicUrl(requestContext) + requestContext.request.path;
                
                const partitionKey = partitionKeyProvider(requestContext);
                
                const resource = await table.get<T>(partitionKey, id);
                if (!resource) {
                    requestContext.setResponseResourceNotFound();
                    return;
                }
                await table.delete(partitionKey, id);
                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }
            }
        )
    );
}
