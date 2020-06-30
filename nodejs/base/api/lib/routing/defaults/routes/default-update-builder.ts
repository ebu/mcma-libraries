import { onResourceUpsert, McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";
import { McmaApiRequestContext } from "../../../http/mcma-api-request-context";

export function defaultUpdateBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string,
    partitionKeyProvider: ((requestContext: McmaApiRequestContext, resource: T) => string)
): DefaultRouteBuilder<T> {
    return new DefaultRouteBuilder<T>(
        "PUT",
        root + "/{id}",
        new DefaultRouteHandlerConfigurator<T>((onStarted, onCompleted) =>
            async (requestContext) => {
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

                onResourceUpsert(resource, getPublicUrl(requestContext) + requestContext.request.path);
                
                const dbTable = await dbTableProvider.get(getTableName(requestContext));

                const partitionKey = partitionKeyProvider(requestContext, resource);
                
                await dbTable.put<T>(partitionKey, resource.id, resource);

                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }

                requestContext.setResponseBody(resource);
            }
        )
    );
}
