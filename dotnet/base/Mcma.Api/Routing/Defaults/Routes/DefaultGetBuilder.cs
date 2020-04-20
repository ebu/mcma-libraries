using System.Net.Http;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultGetBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDbTableProvider dbTableProvider, string root) where TResource : McmaResource
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
                                await onStarted.Invoke(requestContext);

                            var id = requestContext.CurrentRequestPublicUrl();

                            // get the resource from the database
                            var resource =
                                await dbTableProvider.Get<TResource>(requestContext.TableName()).GetAsync(id);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return the resource as json, if found; otherwise, this will return a 404
                            if (resource != null)
                                requestContext.SetResponseBody(resource);
                            else
                                requestContext.SetResponseResourceNotFound();
                        }));
    }
}