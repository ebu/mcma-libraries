using System.Threading.Tasks;
using System;

namespace Mcma.Api.Routing.Defaults
{
    internal delegate Func<McmaApiRequestContext, Task> DefaultRouteHandlerBuilder<TResult>(
        Func<McmaApiRequestContext, Task<bool>> onStarted,
        Func<McmaApiRequestContext, TResult, Task> onCompleted);
}
