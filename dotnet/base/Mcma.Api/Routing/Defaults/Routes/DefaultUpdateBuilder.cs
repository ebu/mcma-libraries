using System.Net.Http;
using Mcma;
using Mcma.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultUpdateBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDocumentDatabaseTableProvider dbTableProvider, string root) where TResource : McmaResource
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
                                if (!await onStarted(requestContext))
                                    return;

                            // ensure the body is set
                            var resource = requestContext.GetRequestBody<TResource>();
                            if (resource == null)
                            {
                                requestContext.SetResponseBadRequestDueToMissingBody();
                                return;
                            }
                            
                            // set properties for upsert
                            resource.OnUpsert(requestContext.CurrentRequestPublicUrl());

                            // upsert the resource
                            var table = await dbTableProvider.GetAsync(requestContext.TableName());
                            await table.PutAsync(requestContext.Request.Path, resource);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted(requestContext, resource);

                            // return the new or updated resource as json
                            requestContext.SetResponseBody(resource);
                        }));
    }
}