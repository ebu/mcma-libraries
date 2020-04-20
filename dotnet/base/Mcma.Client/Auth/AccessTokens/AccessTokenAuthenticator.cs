using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace Mcma.Client.AccessTokens
{
    public class AccessTokenAuthenticator<T> : IAuthenticator
    {
        public AccessTokenAuthenticator(IAccessTokenProvider<T> accessTokenProvider, T authContext)
        {
            AccessTokenProvider = accessTokenProvider ?? throw new ArgumentNullException(nameof(accessTokenProvider));
            AuthContext = authContext;
        }

        private IAccessTokenProvider<T> AccessTokenProvider { get; }

        private T AuthContext { get; }

        private AccessToken AccessToken { get; set; }

        public async Task SignAsync(HttpRequestMessage request)
        {
            if (AccessToken != null && AccessToken.ExpiresOn.HasValue && AccessToken.ExpiresOn >= DateTime.UtcNow)
                AccessToken = null;

            if (AccessToken == null)
                AccessToken = await AccessTokenProvider.GetAccessTokenAsync(AuthContext);

            if (AccessToken != null)
                request.Headers.Authorization = AuthenticationHeaderValue.Parse($"Bearer {AccessToken.Token}");
        }
    }
}