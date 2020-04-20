using System;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public class AuthTypeRegistration<T>
    {
        public AuthTypeRegistration(string authType, Func<T, Task<IAuthenticator>> authenticatorFactory)
        {
            AuthType = authType ?? throw new ArgumentNullException(nameof(authType));
            AuthenticatorFactory = authenticatorFactory ?? throw new ArgumentNullException(nameof(authenticatorFactory));
        }

        public string AuthType { get; }

        public Func<T, Task<IAuthenticator>> AuthenticatorFactory { get; }
    }
}