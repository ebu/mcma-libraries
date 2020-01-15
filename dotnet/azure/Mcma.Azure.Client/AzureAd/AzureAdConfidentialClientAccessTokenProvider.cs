using System;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client.AccessTokens;
using Microsoft.Identity.Client;

namespace Mcma.Azure.Client.AzureAd
{
    public class AzureAdConfidentialClientAccessTokenProvider : IAccessTokenProvider<AzureAdAuthContext>
    {
        public AzureAdConfidentialClientAccessTokenProvider(ConfidentialClientApplicationOptions clientOptions)
        {
            ClientOptions = clientOptions ?? throw new ArgumentNullException(nameof(clientOptions));
        }

        private ConfidentialClientApplicationOptions ClientOptions { get; }

        public async Task<AccessToken> GetAccessTokenAsync(AzureAdAuthContext authContext)
        {
            authContext.ValidateScope();

            var client = ConfidentialClientApplicationBuilder.CreateWithApplicationOptions(ClientOptions).Build();

            var authResult = await client.AcquireTokenForClient(new[] {authContext.Scope }).ExecuteAsync();
            
            return authResult.ToAccessToken();
        }
    }
}