using System.Threading.Tasks;

namespace Mcma.Core
{
    public interface IMcmaAuthenticatorProvider
    {
        /// <summary>
        /// Gets an authenticator for the specified authentication type and context
        /// </summary>
        /// <param name="authType"></param>
        /// <param name="authContext"></param>
        /// <returns></returns>
        Task<IMcmaAuthenticator> GetAuthenticatorAsync(string authType, string authContext);
    }
}