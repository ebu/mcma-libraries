using System.Net.Http;
using Mcma;
using Mcma.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultGetBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDocumentDatabaseTableProvider dbTableProvider, string root) where TResource : McmaResource
            => 
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Get,
                root + "/{id}",
                new DefaultRouteHandlerConfigurator<TResource>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                if (!await onStarted(requestContext))
                                    return;

                            var table = await dbTableProvider.GetAsync(requestContext.TableName());

                            // get the resource from the database
                            var resource = await table.GetAsync<TResource>(requestContext.Request.Path);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted(requestContext, resource);

                            // return the resource as json, if found; otherwise, this will return a 404
                            if (resource != null)
                                requestContext.SetResponseBody(resource);
                            else
                                requestContext.SetResponseResourceNotFound();
                        }));
    }
}