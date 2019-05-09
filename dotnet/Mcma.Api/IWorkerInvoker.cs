using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Api
{
    public interface IWorkerInvoker
    {
        Task RunAsync(string workerFunctionName, object payload);
    }
}
