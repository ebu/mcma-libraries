using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Reflection;
using Mcma.Core;
using Mcma.Core.Serialization;

namespace Mcma.Api.Routes.Defaults
{
    public class DefaultRouteBuilderCollectionRoutes<TResource> where TResource : McmaResource
    {
        internal DefaultRouteBuilderCollectionRoutes()
        {
        }

        internal List<IDefaultRouteBuilder> Included { get; } = new List<IDefaultRouteBuilder>();

        internal void AddAll() => Included.AddRange(new IDefaultRouteBuilder[] { Query, Create, Get, Update, Delete });

        public DefaultRouteBuilder<IEnumerable<TResource>> Query { get; internal set; }

        public DefaultRouteBuilder<TResource> Create { get; internal set; }

        public DefaultRouteBuilder<TResource> Get { get; internal set; }

        public DefaultRouteBuilder<TResource> Update { get; internal set; }

        public DefaultRouteBuilder<TResource> Delete { get; internal set; }
    }
}
