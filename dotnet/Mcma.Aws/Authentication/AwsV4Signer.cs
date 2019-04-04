
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Mcma.Core.Utility;

namespace Mcma.Aws.Authentication
{
    public class AwsV4Signer : IAwsSigner
    {
        public AwsV4Signer(string accessKey, string secretKey, string region, string sessionToken = null, string service = AwsConstants.Services.ExecuteApi)
        {
            AccessKey = accessKey;
            SecretKey = secretKey;
            Region = region;
            SessionToken = sessionToken;
            Service = service;
        }

        private string AccessKey { get; }

        private string SecretKey { get; }

        private string Region { get; }

        private string SessionToken { get; }

        private string Service { get; }

        public async Task<HttpRequestMessage> SignAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var awsDate = new AwsDate();

            // set the host and date headers
            request.Headers.Host = request.RequestUri.Host;
            request.Headers.Add(AwsConstants.Headers.Date, awsDate.DateTimeString);

            // build the string to sign from the canonical request
            var stringToSign = StringToSign(awsDate, await request.ToHashedCanonicalRequestAsync());

            // get the signing key using the date on the request
            var signingKey = SigningKey(awsDate);

            // build the signature by signing the string to sign with the signing key
            var signature = signingKey.UseToSign(stringToSign).HexEncode();

            // set the auth headers
            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    AwsConstants.Signing.Algorithm,
                    $"Credential={AccessKey}/{CredentialScope(awsDate)}, SignedHeaders={request.SignedHeaders()}, Signature={signature}");
            
            // add the session token, if any, to the headers on the request
            if (!string.IsNullOrWhiteSpace(SessionToken))
                request.Headers.Add(AwsConstants.Headers.SecurityToken, SessionToken);

            return request;
        }

        private string StringToSign(AwsDate awsDate, string hashedRequest) 
            =>
                AwsConstants.Signing.Algorithm + "\n" +
                awsDate.DateTimeString + "\n" +
                CredentialScope(awsDate) + "\n" +
                hashedRequest;

        private byte[] SigningKey(AwsDate awsDate)
            =>
                Encoding.UTF8.GetBytes(AwsConstants.Signing.SecretKeyPrefix + SecretKey)
                    .UseToSign(awsDate.DateString)
                    .UseToSign(Region)
                    .UseToSign(Service)
                    .UseToSign(AwsConstants.Signing.ScopeTerminator);

        private string CredentialScope(AwsDate awsDate)
            => $"{awsDate.DateString}/{Region}/{Service}/{AwsConstants.Signing.ScopeTerminator}";
    }
}