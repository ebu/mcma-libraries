using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using Mcma.Api.QueryFilters;
using Mcma.Api.Routes;
using Mcma.Api.Routing.Defaults.Routes;
using Mcma.Core;
using Mcma.Core.Utility;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults
{
    public class DefaultRouteCollectionBuilder<TResource> where TResource : McmaResource
    {
        public DefaultRouteCollectionBuilder(IDbTableProvider dbTableProvider, string root = null)
        {
            DbTableProvider = dbTableProvider;

            root = root ?? typeof(TResource).Name.CamelCaseToKebabCase().PluralizeKebabCase();
            if (!root.StartsWith("/"))
                root = "/" + root;

            Root = root;
            
            Routes = new DefaultRouteCollection<TResource>
            {
                Query = DefaultQueryBuilder.Get<TResource>(DbTableProvider, new InMemoryQueryFilterExpressionProvider(), Root),
                Create = DefaultCreateBuilder.Get<TResource>(DbTableProvider, Root),
                Get = DefaultGetBuilder.Get<TResource>(DbTableProvider, Root),
                Update = DefaultUpdateBuilder.Get<TResource>(DbTableProvider, Root),
                Delete = DefaultDeleteBuilder.Get<TResource>(DbTableProvider, Root)
            };
        }

        private IDbTableProvider DbTableProvider { get; }

        private string Root { get; }

        private DefaultRouteCollection<TResource> Routes { get; }

        public McmaApiRouteCollection Build()
            => new McmaApiRouteCollection(Routes.Included.Select(rb => rb.Build()));

        public DefaultRouteCollectionBuilder<TResource> AddAll()
        {
            Routes.AddAll();
            return this;
        }

        public DefaultRouteConfigurator<TResource, TResult> Route<TResult>(
            Expression<Func<DefaultRouteCollection<TResource>, DefaultRouteBuilder<TResult>>> selectRoute)
        {
            if (!(selectRoute.Body is MemberExpression memberExpression) ||
                !(memberExpression.Member is PropertyInfo propertyInfo) ||
                !typeof(DefaultRouteBuilder<TResult>).IsAssignableFrom(propertyInfo.PropertyType))
                throw new Exception($"Invalid route selection expression: {selectRoute}");

            var routeBuilder = selectRoute.Compile().Invoke(Routes);
            if (routeBuilder == null)
                throw new Exception("Invalid route selection expression");

            return new DefaultRouteConfigurator<TResource, TResult>(this, Routes, routeBuilder);
        }
    }
}
