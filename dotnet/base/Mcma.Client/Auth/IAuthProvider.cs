using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IAuthProvider
    {
        IAuthProvider Add<T>(AuthTypeRegistration<T> registration);

        Task<IAuthenticator> GetAsync(string authType, object authContext = default);
    }
}