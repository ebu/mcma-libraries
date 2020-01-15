using System;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client.AccessTokens;
using Microsoft.Identity.Client;

namespace Mcma.Azure.Client.AzureAd
{
    public class AzureAdPublicClientAccessTokenProvider : IAccessTokenProvider<AzureAdAuthContext>
    {
        public AzureAdPublicClientAccessTokenProvider(PublicClientApplicationOptions clientOptions, string userAccountId = null)
        {
            ClientOptions = clientOptions ?? throw new ArgumentNullException(nameof(clientOptions));
            UserAccountId = userAccountId;

            Client = PublicClientApplicationBuilder.CreateWithApplicationOptions(ClientOptions).Build();
        }

        private PublicClientApplicationOptions ClientOptions { get; }

        private string UserAccountId { get; set; }

        private IPublicClientApplication Client { get; }

        public async Task<AccessToken> GetAccessTokenAsync(AzureAdAuthContext authContext)
        {
            authContext.ValidateScope();

            AuthenticationResult authResult = null;

            if (!string.IsNullOrWhiteSpace(UserAccountId))
            {
                try
                {
                    var account = await Client.GetAccountAsync(UserAccountId);
                    if (account != null)
                        authResult = await Client.AcquireTokenSilent(new[] {authContext.Scope }, account).ExecuteAsync();
                }
                catch (MsalUiRequiredException)
                {
                    // catch and move on, as this will then fall into the interactive call below
                }
            }

            if (authResult == null)
            {
                authResult = await Client.AcquireTokenInteractive(new[] {authContext.Scope }).ExecuteAsync();

                UserAccountId = authResult.Account.HomeAccountId.Identifier;
            }

            return authResult.ToAccessToken();
        }
    }
}