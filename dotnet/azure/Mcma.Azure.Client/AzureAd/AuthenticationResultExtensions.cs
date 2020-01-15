using Mcma.Client.AccessTokens;
using Microsoft.Identity.Client;

namespace Mcma.Azure.Client.AzureAd
{
    public static class AuthenticationResultExtensions
    {
        public static AccessToken ToAccessToken(this AuthenticationResult authResult)
            => new AccessToken { Token = authResult.AccessToken, ExpiresOn = authResult.ExpiresOn };
    }
}