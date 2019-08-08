using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public class AuthProvider : IAuthProvider
    {
        private Dictionary<string, Func<string, Task<IAuthenticator>>> RegisteredAuthTypes { get; }
            = new Dictionary<string, Func<string, Task<IAuthenticator>>>(StringComparer.OrdinalIgnoreCase);

        public IAuthProvider Add(string authType, Func<string, Task<IAuthenticator>> authenticatorFactory)
        {
            if (RegisteredAuthTypes.ContainsKey(authType))
                throw new Exception("Auth type '" + authType + "' has already been registered.");

            RegisteredAuthTypes[authType] = authenticatorFactory;

            return this;
        }

        public async Task<IAuthenticator> GetAsync(string authType, string authContext = null)
            => RegisteredAuthTypes.ContainsKey(authType) ? await RegisteredAuthTypes[authType](authContext) : null;
    }
}