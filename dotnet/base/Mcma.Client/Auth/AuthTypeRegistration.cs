using System;
using System.Threading.Tasks;
using Mcma.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Client
{
    public class AuthTypeRegistration<T> : IAuthTypeRegistration
    {
        public AuthTypeRegistration(string authType, Func<T, Task<IAuthenticator>> authenticatorFactory)
        {
            AuthType = authType ?? throw new ArgumentNullException(nameof(authType));
            AuthenticatorFactory = authenticatorFactory ?? throw new ArgumentNullException(nameof(authenticatorFactory));
        }

        public string AuthType { get; }
        
        public Type ContextType => typeof(T);

        private Func<T, Task<IAuthenticator>> AuthenticatorFactory { get; }

        public async Task<IAuthenticator> CreateAuthenticatorAsync(object context)
        {
            if (context is string contextStr && TryParseContext(contextStr, out var parsedContext))
                context = parsedContext;
            
            if (context is null)
                return await AuthenticatorFactory(default);

            return context is T typedContext
                       ? await AuthenticatorFactory(typedContext)
                       : throw new McmaException(
                             $"Auth type {AuthType} expects an auth context of type {typeof(T)} but was given an auth context of type {context.GetType()}");
        }

        public static bool TryParseContext(string context, out T mcmaObject)
        {
            mcmaObject = default;
            try
            {
                mcmaObject = JToken.Parse(context).ToMcmaObject<T>();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}