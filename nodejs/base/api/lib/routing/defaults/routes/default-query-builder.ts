import { McmaResource, getTableName, McmaResourceType } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import * as filters from "../../../filters";
import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultQueryBuilder<T extends McmaResource>(type: McmaResourceType<T>, dbTableProvider: DbTableProvider, root: string): DefaultRouteBuilder<T[]> {
    return new DefaultRouteBuilder<T[]>(
        "GET",
        root,
        new DefaultRouteHandlerConfigurator<T[]>((onStarted?, onCompleted?) => 
            async (requestContext) => {
                if (onStarted) {
                    const continueRequest = await onStarted(requestContext);
                    if (continueRequest !== undefined && !continueRequest) {
                        return;
                    }
                }
                const filter = requestContext.request.queryStringParameters && Object.keys(requestContext.request.queryStringParameters).length > 0
                    ? filters.inMemoryTextValues<T>(requestContext.request.queryStringParameters)
                    : null;
                const resources = await dbTableProvider.get<T>(getTableName(requestContext), type).query(filter);
                if (onCompleted) {
                    await onCompleted(requestContext, resources);
                }
                requestContext.setResponseBody(resources);
            }
        )
    );
}
