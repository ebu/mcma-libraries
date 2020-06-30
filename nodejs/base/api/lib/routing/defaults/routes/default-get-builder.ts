import { McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";
import { McmaApiRequestContext } from "../../../http/mcma-api-request-context";

export function defaultGetBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string,
    partitionKeyProvider: ((requestContext: McmaApiRequestContext) => string)
): DefaultRouteBuilder<T> {
    return new DefaultRouteBuilder<T>(
        "GET",
        root + "/{id}",
        new DefaultRouteHandlerConfigurator<T>((onStarted, onCompleted) =>
            async (requestContext) => {
                if (onStarted) {
                    const continueRequest = await onStarted(requestContext);
                    if (continueRequest !== undefined && !continueRequest) {
                        return;
                    }
                }
                
                const id = getPublicUrl(requestContext) + requestContext.request.path;

                const dbTable = await dbTableProvider.get(getTableName(requestContext));

                const partitionKey = partitionKeyProvider(requestContext);

                const resource = await dbTable.get<T>(partitionKey, id);
                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }
                if (resource) {
                    requestContext.setResponseBody(resource);
                }
                else {
                    requestContext.setResponseResourceNotFound();
                }
            }
        )
    );
}
