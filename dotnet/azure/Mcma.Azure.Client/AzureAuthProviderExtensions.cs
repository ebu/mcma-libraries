using System;
using Mcma.Azure.Client.AzureAd;
using Mcma.Azure.Client.FunctionKeys;
using Mcma.Client;
using Mcma.Client.AccessTokens;
using Microsoft.Identity.Client;

namespace Mcma.Azure.Client
{
    public static class AzureAuthProviderExtensions
    {
        public static IAuthProvider AddAzureFunctionKeyAuth(this IAuthProvider authProvider, string decryptionKey = null)
            => authProvider.Add<AzureFunctionKeyAuthContext>(
                AzureConstants.FunctionKeyAuthType,
                authContext =>
                {
                    if (authContext == null)
                        throw new Exception($"Context for Azure function key authentication was not provided.");

                    return new AzureFunctionKeyAuthenticator(authContext, decryptionKey);
                }
            );

        public static IAuthProvider AddAzureAdManagedIdentityAuth(this IAuthProvider authProvider)
        {
            var managedIdentityTokenProvider = new AzureManagedIdentityAccessTokenProvider();

            return authProvider.Add<AzureAdAuthContext>(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (authContext == null)
                        throw new Exception($"Context for Azure AD managed identity authentication was not provided.");

                    return new AccessTokenAuthenticator<AzureAdAuthContext>(managedIdentityTokenProvider, authContext);
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

            return authProvider.Add<AzureAdAuthContext>(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (authContext == null)
                        throw new Exception($"Context for Azure AD public client authentication was not provided.");

                    return new AccessTokenAuthenticator<AzureAdAuthContext>(publicClientTokenProvider, authContext);
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

            return authProvider.Add<AzureAdAuthContext>(
                AzureConstants.AzureAdAuthType,
                authContext =>
                {
                    if (authContext == null)
                        throw new Exception($"Context for Azure AD confidential client authentication was not provided.");

                    return new AccessTokenAuthenticator<AzureAdAuthContext>(confidentialClientTokenProvider, authContext);
                });
        }
    }
}
