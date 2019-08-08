using System;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IAuthProvider
    {
        /// <summary>
        /// Adds an authenticator
        /// </summary>
        /// <param name="authType"></param>
        /// <param name="authenticatorFactory"></param>
        /// <returns></returns>
        IAuthProvider Add(string authType, Func<string, Task<IAuthenticator>> authenticatorFactory);

        /// <summary>
        /// Gets an authenticator for the specified authentication type and context
        /// </summary>
        /// <param name="authType"></param>
        /// <param name="authContext"></param>
        /// <returns></returns>
        Task<IAuthenticator> GetAsync(string authType, string authContext = null);
    }
}