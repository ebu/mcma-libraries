
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Mcma.Context;
using Mcma.Data;
using Mcma.Data.DocumentDatabase.Queries;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultQueryBuilder
    {
        public static DefaultRouteBuilder<IEnumerable<TResource>> Get<TResource>(
            IDocumentDatabaseTableProvider dbTableProvider,
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
                                if (!await onStarted(requestContext))
                                    return;

                            var table = await dbTableProvider.GetAsync(requestContext.TableName());

                            // get all resources from the table, applying in-memory filtering using the query string (if any)
                            var resources = (await table.QueryAsync(requestContext.ToQuery<TResource>())).ToArray();

                            // invoke the completion handler with the results
                            if (onCompleted != null)
                                await onCompleted(requestContext, resources);

                            // return the results as JSON in the body of the response
                            // NOTE: This will never return a 404 - just an empty collection
                            requestContext.SetResponseBody(resources);
                        }));
    }
}