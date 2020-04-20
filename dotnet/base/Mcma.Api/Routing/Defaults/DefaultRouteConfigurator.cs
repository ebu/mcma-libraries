
using System;
using Mcma.Core;

namespace Mcma.Api.Routing.Defaults
{
    public class DefaultRouteConfigurator<TResource, TResult> where TResource : McmaResource
    {
        internal DefaultRouteConfigurator(
            DefaultRouteCollectionBuilder<TResource> builder,
            DefaultRouteCollection<TResource> routes,
            DefaultRouteBuilder<TResult> routeBuilder)
        {
            Builder = builder;
            Routes = routes;
            RouteBuilder = routeBuilder;
        }

        private DefaultRouteCollectionBuilder<TResource> Builder { get; }

        private DefaultRouteCollection<TResource> Routes { get; }

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
}