using System;
using System.Threading.Tasks;
using Mcma.Client.AccessTokens;
using Microsoft.Azure.Services.AppAuthentication;

namespace Mcma.Azure.Client.AzureAd
{
    public class AzureManagedIdentityAccessTokenProvider : IAccessTokenProvider<AzureAdAuthContext>
    {
        private AzureServiceTokenProvider AzureServiceTokenProvider { get; } = new AzureServiceTokenProvider();

        public async Task<AccessToken> GetAccessTokenAsync(AzureAdAuthContext authContext)
        {
            authContext.ValidateScope();

            var scopeAsUrl = new Uri(authContext.Scope);

            var resource = $"{scopeAsUrl.Scheme}://{scopeAsUrl.Host}";

            var authResult = await AzureServiceTokenProvider.GetAuthenticationResultAsync(resource);

            return new AccessToken
            {
                Token = authResult.AccessToken,
                ExpiresOn = authResult.ExpiresOn
            };
        }
    }
}