using System;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core.Serialization;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.Client
{
    public static class AzureAuthProviderExtensions
    {
        public static IAuthProvider AddAzureFunctionKeyAuth(this IAuthProvider authProvider, string decryptionKey = null)
            => authProvider.Add(
                AzureConstants.AzureFunctionKeyAuth,
                authContext =>
                {
                    if (string.IsNullOrWhiteSpace(authContext))
                        throw new Exception("Auth context for AzureFunctionKey was not provided.");

                    return Task.FromResult<IAuthenticator>(
                        new AzureFunctionKeyAuthenticator(JObject.Parse(authContext).ToMcmaObject<AzureFunctionKeyAuthContext>(), decryptionKey));
                }
            );
    }
}
