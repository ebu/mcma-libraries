using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IAuthProvider
    {
        IAuthProvider Add<T>(AuthTypeRegistration<T> registration);

        Task<IAuthenticator> GetAsync<T>(string authType, T authContext = default(T));
    }
}