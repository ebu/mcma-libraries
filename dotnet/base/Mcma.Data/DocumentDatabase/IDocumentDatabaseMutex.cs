using System.Threading.Tasks;

namespace Mcma.Data
{
    public interface IDocumentDatabaseMutex
    {
        Task LockAsync();

        Task UnlockAsync();
    }
}