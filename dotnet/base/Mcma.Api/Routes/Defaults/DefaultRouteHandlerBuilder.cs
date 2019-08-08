using System.Threading.Tasks;
using System;

namespace Mcma.Api.Routes.Defaults
{
    internal class DefaultRouteHandlerBuilder<TResult>
    {
        internal DefaultRouteHandlerBuilder(
            Func<Func<McmaApiRequestContext, Task>, Func<McmaApiRequestContext, TResult, Task>, Func<McmaApiRequestContext, Task>> handlerBuilder)
        {
            HandlerBuilder = handlerBuilder;
        }

        private Func<Func<McmaApiRequestContext, Task>, Func<McmaApiRequestContext, TResult, Task>, Func<McmaApiRequestContext, Task>> HandlerBuilder { get; }

        internal Func<McmaApiRequestContext, Task> OnStarted { get; set; }

        internal Func<McmaApiRequestContext, TResult, Task> OnCompleted { get; set; }

        internal Func<McmaApiRequestContext, Task> Create() => HandlerBuilder(OnStarted, OnCompleted);
    }
}
