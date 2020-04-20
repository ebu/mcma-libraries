using System;
using System.Net.Http;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults.Routes
{
    public static class DefaultCreateBuilder
    {
        public static DefaultRouteBuilder<TResource> Get<TResource>(IDbTableProvider dbTableProvider, string root) where TResource : McmaResource
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
                                await onStarted.Invoke(requestContext);

                            // ensure the body is set
                            var resource = requestContext.GetRequestBody<TResource>();
                            if (resource == null)
                            {
                                requestContext.SetResponseBadRequestDueToMissingBody();
                                return;
                            }

                            var id = requestContext.PublicUrlForPath($"{root}/{Guid.NewGuid()}");

                            // initialize the new resource with an ID
                            resource.OnCreate(id);

                            // put the new object into the table
                            await dbTableProvider.Get<TResource>(requestContext.TableName()).PutAsync(resource.Id, resource);

                            // invoke the completion handler (if any) with the newly-created resource
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return a Created status with the id of the resource
                            requestContext.SetResponseResourceCreated(resource);
                        }));
    }
}