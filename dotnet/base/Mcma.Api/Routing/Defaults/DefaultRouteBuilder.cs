using System.Threading.Tasks;
using System;
using System.Net.Http;
using Mcma.Api.Routes;

namespace Mcma.Api.Routing.Defaults
{
    public class DefaultRouteBuilder<TResult> : IDefaultRouteBuilder
    {
        internal DefaultRouteBuilder(HttpMethod method, string path, DefaultRouteHandlerConfigurator<TResult> defaultHandlerConfigurator)
        {
            Method = method;
            Path = path;
            DefaultRouteHandlerConfigurator = defaultHandlerConfigurator;
        }

        private HttpMethod Method { get; }

        private string Path { get; }

        private DefaultRouteHandlerConfigurator<TResult> DefaultRouteHandlerConfigurator { get; }

        internal Func<McmaApiRequestContext, Task> Handler { get; set; }

        public DefaultRouteBuilder<TResult> OverrideHandler(Func<McmaApiRequestContext, Task> handler)
        {
            Handler = handler;
            return this;
        }

        public DefaultRouteBuilder<TResult> OnStarted(Func<McmaApiRequestContext, Task<bool>> onStarted)
        {
            DefaultRouteHandlerConfigurator.OnStarted = onStarted; 
            return this;
        }

        public DefaultRouteBuilder<TResult> OnCompleted(Func<McmaApiRequestContext, TResult, Task> onCompleted)
        {
            DefaultRouteHandlerConfigurator.OnCompleted = onCompleted; 
            return this;
        }

        McmaApiRoute IDefaultRouteBuilder.Build() => Build();

        internal McmaApiRoute Build() => new McmaApiRoute(Method, Path, Handler ?? DefaultRouteHandlerConfigurator.Create());
    }
}
