using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorker
    {
        Task DoWorkAsync(WorkerRequest request);
    }
}
