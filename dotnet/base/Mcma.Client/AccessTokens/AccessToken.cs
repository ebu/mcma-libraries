using System;

namespace Mcma.Client.AccessTokens
{
    public class AccessToken
    {
        public string Token { get; set; }

        public DateTimeOffset? ExpiresOn { get; set; }
    }
}