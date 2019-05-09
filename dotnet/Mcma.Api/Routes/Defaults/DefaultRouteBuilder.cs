using System.Threading.Tasks;
using System;
using System.Net.Http;

namespace Mcma.Api.Routes.Defaults
{
    public class DefaultRouteBuilder<TResult> : IDefaultRouteBuilder
    {
        internal DefaultRouteBuilder(HttpMethod method, string path, DefaultRouteHandlerBuilder<TResult> defaultHandlerBuilder)
        {
            Method = method;
            Path = path;
            DefaultHandlerBuilder = defaultHandlerBuilder;
        }

        private HttpMethod Method { get; }

        private string Path { get; }

        private DefaultRouteHandlerBuilder<TResult> DefaultHandlerBuilder { get; }

        McmaApiRoute IDefaultRouteBuilder.Build() => Build();

        internal McmaApiRoute Build() => new McmaApiRoute(Method, Path, Handler ?? DefaultHandlerBuilder.Create());

        internal Func<McmaApiRequestContext, Task> Handler { get; set; }

        public void OverrideHandler(Func<McmaApiRequestContext, Task> handler) => Handler = handler;

        public DefaultRouteBuilder<TResult> OnStarted(Func<McmaApiRequestContext, Task> onStarted)
        {
            DefaultHandlerBuilder.OnStarted = onStarted; 
            return this;
        }

        public DefaultRouteBuilder<TResult> OnCompleted(Func<McmaApiRequestContext, TResult, Task> onCompleted)
        {
            DefaultHandlerBuilder.OnCompleted = onCompleted; 
            return this;
        }
    }
}
