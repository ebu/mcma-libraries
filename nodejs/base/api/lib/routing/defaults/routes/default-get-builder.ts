import { McmaResource, getTableName } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";
import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultGetBuilder<T extends McmaResource>(dbTableProvider: DbTableProvider, root: string): DefaultRouteBuilder<T> {
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
                const resource = await dbTableProvider.get<T>(getTableName(requestContext)).get(getPublicUrl(requestContext) + requestContext.request.path);
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
