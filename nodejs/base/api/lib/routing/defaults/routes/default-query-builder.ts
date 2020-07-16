import { McmaResource, getTableName } from "@mcma/core";
import { DocumentDatabaseTableProvider, getFilterExpressionFromKeyValuePairs, FilterExpression } from "@mcma/data";

import { DefaultRouteHandlerConfigurator } from "../default-route-handler-configurator";
import { DefaultRouteBuilder } from "../default-route-builder";

export function defaultQueryBuilder<T extends McmaResource>(
    dbTableProvider: DocumentDatabaseTableProvider,
    root: string
): DefaultRouteBuilder<T[]> {
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

                const filterExpression: FilterExpression<T> =
                    requestContext.request.queryStringParameters && Object.keys(requestContext.request.queryStringParameters).length > 0
                        ? getFilterExpressionFromKeyValuePairs<T>(requestContext.request.queryStringParameters)
                        : null;

                let pageNumber = 0;
                if (requestContext.request.queryStringParameters["pageNumber"]) {
                    pageNumber = parseInt(requestContext.request.queryStringParameters["pageNumber"]);
                    if (isNaN(pageNumber)) {
                        pageNumber = 0;
                    }
                }

                let pageSize: number;
                if (requestContext.request.queryStringParameters["pageSize"]) {
                    pageSize = parseInt(requestContext.request.queryStringParameters["pageSize"]);
                    if (isNaN(pageSize)) {
                        pageSize = null;
                    }
                }

                const table = await dbTableProvider.get(getTableName(requestContext));

                const resources = await table.query<T>({ path: requestContext.request.path, pageNumber, pageSize, filterExpression });
                if (onCompleted) {
                    await onCompleted(requestContext, resources);
                }

                requestContext.setResponseBody(resources);
            }
        )
    );
}
