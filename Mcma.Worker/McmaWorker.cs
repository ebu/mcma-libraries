using System.Threading.Tasks;

namespace Mcma.Worker
{
    public static class McmaWorker
    {
        public static Task DoWorkAsync<TWorker, TRequest>(string operation, TRequest request) where TWorker : IWorker<TRequest>, new()
        {
            var worker = new TWorker();
            
            return worker.DoWorkAsync(operation, request);
        }
    }
}
