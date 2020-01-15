using System.Threading.Tasks;

namespace Mcma.Client.AccessTokens
{
    public interface IAccessTokenProvider<T>
    {
        Task<AccessToken> GetAccessTokenAsync(T authContext);
    }
}