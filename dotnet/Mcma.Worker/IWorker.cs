using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace Mcma.Worker
{
    public interface IWorker
    {
        Task DoWorkAsync(string operation, object request);
    }

    public interface IWorker<T> : IWorker
    {
        Task DoWorkAsync(string operation, T request);
    }
}
