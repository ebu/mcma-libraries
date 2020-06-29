import { McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultDeleteBuilder<T extends McmaResource>(
    type: McmaResourceType<T>,
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
                const table = dbTableProvider.get<T>(getTableName(requestContext), type);
                const id = getPublicUrl(requestContext) + requestContext.request.path;
                const resource = await table.get(Utils.getTypeName(type), id);
                if (!resource) {
                    requestContext.setResponseResourceNotFound();
                    return;
                }
                await table.delete(Utils.getTypeName(type), id);
                if (onCompleted) {
                    await onCompleted(requestContext, resource);
                }
            }
        )
    );
}
