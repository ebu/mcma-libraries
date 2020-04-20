using System.Net.Http;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultUpdateBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDbTableProvider dbTableProvider, string root) where TResource : McmaResource
            =>
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Put,
                root + "/{id}",
                new DefaultRouteHandlerConfigurator<TResource>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            // ensure the body is set
                            var resource = requestContext.GetRequestBody<TResource>();
                            if (resource == null)
                            {
                                requestContext.SetResponseBadRequestDueToMissingBody();
                                return;
                            }

                            var id = requestContext.CurrentRequestPublicUrl();
                            
                            // set properties for upsert
                            resource.OnUpsert(id);

                            // upsert the resource
                            await dbTableProvider.Get<TResource>(requestContext.TableName()).PutAsync(resource.Id, resource);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return the new or updated resource as json
                            requestContext.SetResponseBody(resource);
                        }));
    }
}