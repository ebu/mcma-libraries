using System.Threading.Tasks;
using System;

namespace Mcma.Api.Routing.Defaults
{
    internal class DefaultRouteHandlerConfigurator<TResult>
    {
        internal DefaultRouteHandlerConfigurator(DefaultRouteHandlerBuilder<TResult> handlerBuilder)
        {
            HandlerBuilder = handlerBuilder;
        }

        private DefaultRouteHandlerBuilder<TResult> HandlerBuilder { get; }

        internal Func<McmaApiRequestContext, Task> OnStarted { get; set; }

        internal Func<McmaApiRequestContext, TResult, Task> OnCompleted { get; set; }

        internal Func<McmaApiRequestContext, Task> Create() => HandlerBuilder(OnStarted, OnCompleted);
    }
}
