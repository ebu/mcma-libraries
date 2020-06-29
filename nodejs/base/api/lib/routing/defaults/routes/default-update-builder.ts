import { onResourceUpsert, McmaResource, getTableName, McmaResourceType } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultUpdateBuilder<T extends McmaResource>(
    type: McmaResourceType<T>,
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
                await dbTableProvider.get<T>(getTableName(requestContext), type).put(resource);
                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }
                requestContext.setResponseBody(resource);
            }
        )
    );
}
