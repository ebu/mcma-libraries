import { uuid } from "uuidv4";
import { onResourceCreate, McmaResource, getTableName, McmaResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import { getPublicUrl } from "../../../context-variable-provider-ext";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultCreateBuilder<T extends McmaResource>(type: McmaResourceType<T>, dbTableProvider: DbTableProvider, root: string): DefaultRouteBuilder<T> {
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

                    const resource = requestContext.getRequestBody();
                    if (!resource) {
                        requestContext.setResponseBadRequestDueToMissingBody();
                        return;
                    }

                    onResourceCreate(resource, getPublicUrl(requestContext) + root + "/" + uuid());
                    
                    await dbTableProvider.get<T>(getTableName(requestContext), type).put(resource.id, resource);
                    
                    if (onCompleted) {
                        await onCompleted(requestContext, resource);
                    }
                    
                    requestContext.setResponseResourceCreated(resource);
                }
        )
    );
}
