using System;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public static class AuthProviderExtensions
    {
        public static IAuthProvider Add<T>(this IAuthProvider authProvider, string authType, Func<T, Task<IAuthenticator>> authenticatorFactory)
            => authProvider.Add(new AuthTypeRegistration<T>(authType, authenticatorFactory));
        
        public static IAuthProvider Add<T>(this IAuthProvider authProvider, string authType, Func<T, IAuthenticator> authenticatorFactory)
            => authProvider.Add<T>(authType, x => Task.FromResult(authenticatorFactory(x)));
    }
}