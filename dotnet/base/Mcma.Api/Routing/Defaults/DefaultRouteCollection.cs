using System.Collections.Generic;
using Mcma;

namespace Mcma.Api.Routing.Defaults
{
    public class DefaultRouteCollection<TResource> where TResource : McmaResource
    {           
        internal DefaultRouteCollection()
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
