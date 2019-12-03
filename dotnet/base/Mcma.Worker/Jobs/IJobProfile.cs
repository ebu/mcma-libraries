using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Worker
{
    public interface IJobProfile<TJob> where TJob : Job
    {
        string Name { get; }

        Task ExecuteAsync(ProcessJobAssignmentHelper<TJob> job);
    }
}
