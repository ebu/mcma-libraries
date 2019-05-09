using System.Threading.Tasks;
using Mcma.Worker.Builders;

namespace Mcma.Worker
{
    public static class McmaWorker
    {
        public static WorkerBuilder Builder() => new WorkerBuilder();
    }
}
