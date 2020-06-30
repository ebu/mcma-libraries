import { v4 as uuidv4 } from "uuid";
import { onResourceCreate, McmaResource, getTableName, McmaResourceType, Utils } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";
import { McmaApiRequestContext } from "../../../http/mcma-api-request-context";

export function defaultCreateBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string,
    partitionKeyProvider?: ((requestContext: McmaApiRequestContext, resource: T) => string)
): DefaultRouteBuilder<T> {
    return new DefaultRouteBuilder<T>(
        "POST",
        root,
        new DefaultRouteHandlerConfigurator<T>(
            (onStarted?, onCompleted?) =>
                async (requestContext) => {
                    if (onStarted) {
                        const continueRequest = await onStarted(requestContext);
                        if (continueRequest !== undefined && !continueRequest) {
                            return;
                        }
                    }

                    const resource = requestContext.getRequestBody<T>();
                    if (!resource) {
                        requestContext.setResponseBadRequestDueToMissingBody();
                        return;
                    }

                    onResourceCreate(resource, getPublicUrl(requestContext) + root + "/" + uuidv4());
                    
                    const dbTable = await dbTableProvider.get(getTableName(requestContext));

                    const partitionKey = partitionKeyProvider(requestContext, resource);

                    await dbTable.put<T>(partitionKey, resource.id, resource);
                    
                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }
                    
                    requestContext.setResponseResourceCreated(resource);
                }
        )
    );
}
