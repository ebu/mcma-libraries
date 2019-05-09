using System.Collections.Generic;

namespace Mcma.Worker.Builders
{
    internal interface IRequestHandlerBuilder
    {
        IEnumerable<IWorkerOperationFilter> Build();
    }
}
