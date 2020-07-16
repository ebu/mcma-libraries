import { onResourceUpsert, McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultUpdateBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string
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
                
                await dbTable.put<T>(requestContext.request.path, resource);

                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }

                requestContext.setResponseBody(resource);
            }
        )
    );
}
