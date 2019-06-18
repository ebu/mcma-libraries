using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Api
{
    public interface IWorkerInvoker
    {
        Task InvokeAsync(string workerFunctionName, object payload);
    }
}
