using Mcma.Core;
using Mcma.Data;

namespace Mcma.Data
{
    public interface IDbTableProvider<T> where T : McmaResource
    {
        IDbTable<T> Table(string tableName);
    }
}
