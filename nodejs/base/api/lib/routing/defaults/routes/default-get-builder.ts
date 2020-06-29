import { McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultGetBuilder<T extends McmaResource>(
    type: McmaResourceType<T>,
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
                
                const id = getPublicUrl(requestContext) + requestContext.request.path;
                const typeName = Utils.getTypeName(type);

                const resource = await dbTableProvider.get<T>(getTableName(requestContext), type).get(typeName, id);
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
