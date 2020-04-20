
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Mcma.Api.QueryFilters;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultQueryBuilder
    {
        public static DefaultRouteBuilder<IEnumerable<TResource>> Get<TResource>(
            IDbTableProvider dbTableProvider,
            IQueryFilterExpressionProvider queryParameterFilterBuilder,
            string root)
            where TResource : McmaResource
            => 
            new DefaultRouteBuilder<IEnumerable<TResource>>(
                HttpMethod.Get,
                root, 
                new DefaultRouteHandlerConfigurator<IEnumerable<TResource>>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            var filterExpr =
                                requestContext.Request.QueryStringParameters.Any()
                                    ? queryParameterFilterBuilder.CreateFilterExpression<TResource>(requestContext.Request.QueryStringParameters)
                                    : null;

                            // get all resources from the table, applying in-memory filtering using the query string (if any)
                            var resources =
                                (await dbTableProvider.Get<TResource>(requestContext.TableName()).QueryAsync(filterExpr))
                                    .ToList();

                            // invoke the completion handler with the results
                            if (onCompleted != null)
                                await onCompleted(requestContext, resources);

                            // return the results as JSON in the body of the response
                            // NOTE: This will never return a 404 - just an empty collection
                            requestContext.SetResponseBody(resources);
                        }));
    }
}