using System;
using System.Linq;
using Mcma.Core;
using System.Collections.Generic;
using System.Net.Http;
using System.Linq.Expressions;
using System.Reflection;
using Mcma.Data;
using Mcma.Core.ContextVariables;
using Mcma.Core.Utility;

namespace Mcma.Api.Routes.Defaults
{
    public class DefaultRouteCollectionBuilder<TResource> where TResource : McmaResource
    {
        public class RouteBuilderAction<TResult>
        {
            public RouteBuilderAction(
                DefaultRouteCollectionBuilder<TResource> builder,
                DefaultRoutes<TResource> routes,
                DefaultRouteBuilder<TResult> routeBuilder)
            {
                Builder = builder;
                Routes = routes;
                RouteBuilder = routeBuilder;
            }

            private DefaultRouteCollectionBuilder<TResource> Builder { get; }

            private DefaultRoutes<TResource> Routes { get; }

            private DefaultRouteBuilder<TResult> RouteBuilder { get; }

            public DefaultRouteCollectionBuilder<TResource> Configure(Action<DefaultRouteBuilder<TResult>> configure)
            {
                if (!Routes.Included.Contains(RouteBuilder))
                    Routes.Included.Add(RouteBuilder);
                configure(RouteBuilder);
                return Builder;
            }

            public DefaultRouteCollectionBuilder<TResource> Add()
            {
                if (!Routes.Included.Contains(RouteBuilder))
                    Routes.Included.Add(RouteBuilder);
                return Builder;
            }

            public DefaultRouteCollectionBuilder<TResource> Remove()
            {
                if (Routes.Included.Contains(RouteBuilder))
                    Routes.Included.Remove(RouteBuilder);
                return Builder;
            }
        }

        public DefaultRouteCollectionBuilder(IDbTableProvider<TResource> dbTableProvider, string root = null)
        {
            DbTableProvider = dbTableProvider;

            root = root ?? typeof(TResource).Name.CamelCaseToKebabCase().PluralizeKebabCase();
            if (!root.StartsWith("/"))
                root = "/" + root;

            Root = root;
            
            Routes = new DefaultRoutes<TResource>
            {
                Query = DefaultQueryBuilder(dbTableProvider, root),
                Create = DefaultCreateBuilder(dbTableProvider, root),
                Get = DefaultGetBuilder(dbTableProvider, root),
                Update = DefaultUpdateBuilder(dbTableProvider, root),
                Delete = DefaultDeleteBuilder(dbTableProvider, root)
            };
        }

        private IDbTableProvider<TResource> DbTableProvider { get; }

        private string Root { get; }

        private DefaultRoutes<TResource> Routes { get; }

        public McmaApiRouteCollection Build()
            => new McmaApiRouteCollection(Routes.Included.Select(rb => rb.Build()));

        public DefaultRouteCollectionBuilder<TResource> AddAll()
        {
            Routes.AddAll();
            return this;
        }

        public RouteBuilderAction<TResult> Route<TResult>(
            Expression<Func<DefaultRoutes<TResource>, DefaultRouteBuilder<TResult>>> selectRoute)
        {
            if (!(selectRoute.Body is MemberExpression memberExpression) ||
                !(memberExpression.Member is PropertyInfo propertyInfo) ||
                !typeof(DefaultRouteBuilder<TResult>).IsAssignableFrom(propertyInfo.PropertyType))
                throw new Exception($"Invalid route selection expression: {selectRoute}");

            return new RouteBuilderAction<TResult>(this, Routes, (DefaultRouteBuilder<TResult>)propertyInfo.GetValue(Routes));
        }

        private static DefaultRouteBuilder<IEnumerable<TResource>> DefaultQueryBuilder(IDbTableProvider<TResource> dbTableProvider, string root) => 
            new DefaultRouteBuilder<IEnumerable<TResource>>(
                HttpMethod.Get,
                root, 
                new DefaultRouteHandlerBuilder<IEnumerable<TResource>>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            var filterExpr =
                                requestContext.Request.QueryStringParameters.Any()
                                    ? Filters.InMemoryTextValues<TResource>(requestContext.Request.QueryStringParameters)
                                    : null;

                            // get all resources from the table, applying in-memory filtering using the query string (if any)
                            var resources =
                                (await dbTableProvider.Table(requestContext.TableName()).QueryAsync(filterExpr))
                                    .ToList();

                            // invoke the completion handler with the results
                            if (onCompleted != null)
                                await onCompleted(requestContext, resources);

                            // return the results as JSON in the body of the response
                            // NOTE: This will never return a 404 - just an empty collection
                            requestContext.SetResponseBody(resources);
                        }));

        private static DefaultRouteBuilder<TResource> DefaultCreateBuilder(IDbTableProvider<TResource> dbTableProvider, string root) => 
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Post,
                root,
                new DefaultRouteHandlerBuilder<TResource>(
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

                            // initialize the new resource with an ID
                            resource.OnCreate($"{requestContext.PublicUrl()}{root}/{Guid.NewGuid()}");

                            // put the new object into the table
                            await dbTableProvider.Table(requestContext.TableName()).PutAsync(resource.Id, resource);

                            // invoke the completion handler (if any) with the newly-created resource
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return a Created status with the id of the resource
                            requestContext.SetResponseResourceCreated(resource);
                        }));

        private static DefaultRouteBuilder<TResource> DefaultGetBuilder(IDbTableProvider<TResource> dbTableProvider, string root) =>
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Get,
                root + "/{id}",
                new DefaultRouteHandlerBuilder<TResource>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            // get the resource from the database
                            var resource =
                                await dbTableProvider.Table(requestContext.TableName()).GetAsync(requestContext.PublicUrl() + requestContext.Request.Path);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return the resource as json, if found; otherwise, this will return a 404
                            if (resource != null)
                                requestContext.SetResponseBody(resource);
                            else
                                requestContext.SetResponseResourceNotFound();
                        }));

        private static DefaultRouteBuilder<TResource> DefaultUpdateBuilder(IDbTableProvider<TResource> dbTableProvider, string root) =>
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Put,
                root + "/{id}",
                new DefaultRouteHandlerBuilder<TResource>(
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
                            
                            // set properties for upsert
                            resource.OnUpsert(requestContext.PublicUrl() + requestContext.Request.Path);

                            // upsert the resource
                            await dbTableProvider.Table(requestContext.TableName()).PutAsync(resource.Id, resource);

                            // invoke the completion handler, if any
                            if (onCompleted != null)
                                await onCompleted.Invoke(requestContext, resource);

                            // return the new or updated resource as json
                            requestContext.SetResponseBody(resource);
                        }));

        private static DefaultRouteBuilder<TResource> DefaultDeleteBuilder(IDbTableProvider<TResource> dbTableProvider, string root) =>
            new DefaultRouteBuilder<TResource>(
                HttpMethod.Delete,
                root + "/{id}",
                new DefaultRouteHandlerBuilder<TResource>(
                    (onStarted, onCompleted) =>
                        async requestContext =>
                        {
                            // invoke the start handler, if any
                            if (onStarted != null)
                                await onStarted.Invoke(requestContext);

                            // get the table for the resource
                            var table = dbTableProvider.Table(requestContext.TableName());

                            // build id from the root public url and the path
                            var id = requestContext.PublicUrl() + requestContext.Request.Path;

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
