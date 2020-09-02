using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public class AuthProvider : IAuthProvider
    {   
        private Dictionary<string, IAuthTypeRegistration> AuthTypeRegistrations { get; } = new Dictionary<string, IAuthTypeRegistration>(StringComparer.OrdinalIgnoreCase);
        
        public IAuthProvider Add<T>(AuthTypeRegistration<T> registration)
        {
            if (AuthTypeRegistrations.ContainsKey(registration.AuthType))
                throw new McmaException($"Auth type '{registration.AuthType}' has already been registered.");

            AuthTypeRegistrations[registration.AuthType] = registration;
            return this;
        }

        public async Task<IAuthenticator> GetAsync(string authType, object authContext = default)
        {
            if (!AuthTypeRegistrations.ContainsKey(authType))
                return null;

            if (authContext is string authContextStr)
            {
                try
                {

                }
                catch
                {
                    // nothing to do, just pass it along
                }
            }
            
            return await AuthTypeRegistrations[authType].CreateAuthenticatorAsync(authContext);
        }
    }
}