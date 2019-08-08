using System.Collections.Generic;

namespace Mcma.Worker.Builders
{
    internal interface IOperationHandlerBuilder
    {
        IEnumerable<IWorkerOperationFilter> Build();
    }
}
