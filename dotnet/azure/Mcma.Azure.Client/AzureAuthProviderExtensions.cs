using System;
using System.Threading.Tasks;
using Mcma.Azure.Client.AzureAd;
using Mcma.Azure.Client.FunctionKeys;
using Mcma.Client;
using Mcma.Client.AccessTokens;
using Mcma.Core.Serialization;
using Microsoft.Identity.Client;
using Newtonsoft.Json.Linq;

namespace Mcma.Azure.Client
{
    public static class AzureAuthProviderExtensions
    {
        public static IAuthProvider AddAzureFunctionKeyAuth(this IAuthProvider authProvider, string decryptionKey = null)
            => authProvider.Add(
                AzureConstants.FunctionKeyAuthType,
                authContext =>
                {
                    if (string.IsNullOrWhiteSpace(authContext))
                        throw new Exception($"Context for Azure function key authentication was not provided.");

                    return Task.FromResult<IAuthenticator>(
                        new AzureFunctionKeyAuthenticator(JObject.Parse(authContext).ToMcmaObject<AzureFunctionKeyAuthContext>(), decryptionKey));
                }
            );

        public static IAuthProvider AddAzureAdManagedIdentityAuth(this IAuthProvider authProvider)
        {
            var managedIdentityTokenProvider = new AzureManagedIdentityAccessTokenProvider();

            return authProvider.Add(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (string.IsNullOrWhiteSpace(authContext))
                        throw new Exception($"Context for Azure AD managed identity authentication was not provided.");

                    return Task.FromResult<IAuthenticator>(
                        new AccessTokenAuthenticator<AzureAdAuthContext>(
                            managedIdentityTokenProvider,
                            JToken.Parse(authContext).ToMcmaObject<AzureAdAuthContext>()));
                });
        }

        public static IAuthProvider AddAzureAdPublicClientAuth(this IAuthProvider authProvider, string tenantId, string clientId, string userAccountId = null)
        {
            var publicClientTokenProvider =
                new AzureAdPublicClientAccessTokenProvider(
                    new PublicClientApplicationOptions
                    {
                        ClientId = clientId,
                        TenantId = tenantId
                    },
                    userAccountId);

            return authProvider.Add(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (string.IsNullOrWhiteSpace(authContext))
                        throw new Exception($"Context for Azure AD public client authentication was not provided.");

                    return Task.FromResult<IAuthenticator>(
                        new AccessTokenAuthenticator<AzureAdAuthContext>(
                            publicClientTokenProvider,
                            JToken.Parse(authContext).ToMcmaObject<AzureAdAuthContext>()));
                });
        }

        public static IAuthProvider AddAzureAdConfidentialClientAuth(this IAuthProvider authProvider, string tenantId, string clientId, string clientSecret)
        {
            var confidentialClientTokenProvider = 
                new AzureAdConfidentialClientAccessTokenProvider(
                    new ConfidentialClientApplicationOptions
                    {
                        TenantId = tenantId,
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    });

            return authProvider.Add(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (string.IsNullOrWhiteSpace(authContext))
                        throw new Exception($"Context for Azure AD confidential client authentication was not provided.");

                    return Task.FromResult<IAuthenticator>(
                        new AccessTokenAuthenticator<AzureAdAuthContext>(
                            confidentialClientTokenProvider,
                            JToken.Parse(authContext).ToMcmaObject<AzureAdAuthContext>()));
                });
        }
    }
}
