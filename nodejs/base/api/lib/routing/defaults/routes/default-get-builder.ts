import { McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultGetBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string
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

                const dbTable = await dbTableProvider.get(getTableName(requestContext));

                const resource = await dbTable.get<T>(requestContext.request.path);
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
