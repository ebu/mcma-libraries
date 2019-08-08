using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Collections;
using System.Linq;
using System.Net.Http;

namespace Mcma.Api.Routes
{
    public class McmaApiRouteCollection : IEnumerable<McmaApiRoute>
    {
        public McmaApiRouteCollection(params McmaApiRoute[] routes)
            : this((IEnumerable<McmaApiRoute>)routes)
        {
        }

        public McmaApiRouteCollection(IEnumerable<McmaApiRoute> routes = null)
        {
            Routes = routes?.ToList() ?? new List<McmaApiRoute>();
        }

        private List<McmaApiRoute> Routes { get; }

        public McmaApiRouteCollection AddRoute(HttpMethod method, string path, Func<McmaApiRequestContext, Task> handler)
        {
            Routes.Add(new McmaApiRoute(method, path, handler));
            return this;
        }

        public McmaApiRouteCollection AddRoute(string method, string path, Func<McmaApiRequestContext, Task> handler)
        {
            Routes.Add(new McmaApiRoute(method, path, handler));
            return this;
        }

        public McmaApiRouteCollection AddRoute(McmaApiRoute route)
        {
            Routes.Add(route);
            return this;
        }

        public McmaApiRouteCollection AddRoutes(McmaApiRouteCollection routes)
        {
            foreach (var route in routes)
                AddRoute(route);
            return this;
        }

        public IEnumerator<McmaApiRoute> GetEnumerator() => Routes.GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
