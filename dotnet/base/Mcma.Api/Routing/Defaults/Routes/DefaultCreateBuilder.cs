using System;
using System.Net.Http;
using Mcma.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultCreateBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDocumentDatabaseTableProvider dbTableProvider, string root) where TResource : McmaResource
            => 
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Post,
                root,
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

                            var resourcePath = $"{root}/{Guid.NewGuid()}";
                            
                            // initialize the new resource with an ID
                            resource.OnCreate(requestContext.PublicUrlForPath(resourcePath));

                            // put the new object into the table
                            var table = await dbTableProvider.GetAsync(requestContext.TableName());
                            await table.PutAsync(resourcePath, resource);

                            // invoke the completion handler (if any) with the newly-created resource
                            if (onCompleted != null)
                                await onCompleted(requestContext, resource);

                            // return a Created status with the id of the resource
                            requestContext.SetResponseResourceCreated(resource);
                        }));
    }
}