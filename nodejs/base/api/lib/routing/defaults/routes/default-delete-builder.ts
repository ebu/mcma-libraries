import { McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultDeleteBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string
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
                
                const resource = await table.get<T>(requestContext.request.path);
                if (!resource) {
                    requestContext.setResponseResourceNotFound();
                    return;
                }
                await table.delete(requestContext.request.path);
                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }
            }
        )
    );
}
