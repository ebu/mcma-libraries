using System.Net.Http;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultDeleteBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDbTableProvider dbTableProvider, string root) where TResource : McmaResource
            => 
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Delete,
                root + "/{id}",
                new DefaultRouteHandlerConfigurator<TResource>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            // get the table for the resource
                            var table = dbTableProvider.Get<TResource>(requestContext.TableName());

                            // build id from the root public url and the path
                            var id = requestContext.CurrentRequestPublicUrl();

                            // get the resource from the db
                            var resource = await table.GetAsync(id);

                            // if the resource doesn't exist, return a 404
                            if (resource == null)
                            {
                                requestContext.SetResponseResourceNotFound();
                                return;
                            }

                            // delete the resource from the db
                            await table.DeleteAsync(id);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);
                        }));
    }
}