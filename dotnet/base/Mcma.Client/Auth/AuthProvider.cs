using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public class AuthProvider : IAuthProvider
    {
        private Dictionary<string, object> RegisteredAuthTypes { get; } = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        public IAuthProvider Add<T>(AuthTypeRegistration<T> registration)
        {
            if (RegisteredAuthTypes.ContainsKey(registration.AuthType))
                throw new Exception("Auth type '" + registration.AuthType + "' has already been registered.");

            RegisteredAuthTypes[registration.AuthType] = registration.AuthenticatorFactory;

            return this;
        }

        public async Task<IAuthenticator> GetAsync<T>(string authType, T authContext = default(T))
        {
            if (!RegisteredAuthTypes.ContainsKey(authType))
                return null;
            
            var factory = (Func<T, Task<IAuthenticator>>)RegisteredAuthTypes[authType];

            return await factory(authContext);
        }
    }
}