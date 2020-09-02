using System.Threading.Tasks;

namespace Mcma.Data
{
    public interface IDocumentDatabaseTableProvider
    {
        Task<IDocumentDatabaseTable> GetAsync(string tableName);
    }
}