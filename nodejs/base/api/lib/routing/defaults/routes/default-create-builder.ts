import { v4 as uuidv4 } from "uuid";
import { onResourceCreate, McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultCreateBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string
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

                    const resourcePath = root + "/" + uuidv4();

                    onResourceCreate(resource, getPublicUrl(requestContext) + resourcePath);
                    
                    const dbTable = await dbTableProvider.get(getTableName(requestContext));

                    await dbTable.put<T>(resourcePath, resource);
                    
                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }
                    
                    requestContext.setResponseResourceCreated(resource);
                }
        )
    );
}
