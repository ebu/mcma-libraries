using System;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Mcma.Core.Logging;

namespace Mcma.Aws.Authentication
{
    public static class AwsRequestExtensions
    {
        public static string CanonicalUri(this HttpRequestMessage request)
            => string.Join("/", request.RequestUri.AbsolutePath.Split('/').Select(x => Uri.EscapeDataString(Uri.EscapeDataString(x))));

        public static string CanonicalQueryParameters(this HttpRequestMessage request)
            =>
                !string.IsNullOrWhiteSpace(request.RequestUri.Query)
                    ? string.Join("&",
                        request.RequestUri.Query
                            // skip the ? at the start of the query string
                            // I don't think there's ever going to be a case where the query string does NOT start with ?, but
                            // this will handle it in the case that it doesn't for some reason
                            .Substring(request.RequestUri.Query[0] == '?' ? 1 : 0)
                            // break into parts on ampersands
                            .Split('&')
                            // break parts into keys and values
                            .Select(x => x.Split('='))
                            // escape the values
                            .Select(
                                x =>
                                    x.Length == 2
                                        ? new[] {Uri.EscapeDataString(x[0]), Uri.EscapeDataString(x[1])}
                                        : throw new Exception($"Invalid parameters found in query string: {request.RequestUri.Query}"))
                            // order by the keys
                            .OrderBy(x => x[0], StringComparer.Ordinal)
                            // rebuild parts
                            .Select(x => $"{x[0]}={x[1]}"))
                    : string.Empty;
        
        public static string CanonicalHeaders(this HttpRequestMessage request)
            =>
                string.Join("\n",
                    request.Headers
                        // make the keys lowercase and join multiples with a comma
                        .Select(kvp => new[] {kvp.Key.ToLowerInvariant(), string.Join(",", kvp.Value)})
                        // order by the keys
                        .OrderBy(x => x[0], StringComparer.Ordinal)
                        // put keys and values back together using colons
                        .Select(x => $"{x[0]}:{x[1]}"));

        public static string SignedHeaders(this HttpRequestMessage request)
            =>
                string.Join(";",
                    request.Headers
                        .Select(kvp => kvp.Key.ToLowerInvariant())
                        .OrderBy(x => x, StringComparer.Ordinal));

        public static async Task<string> ToCanonicalRequestAsync(this HttpRequestMessage request, HashAlgorithm hashAlgorithm)
            =>
                request.Method.Method.ToUpper() + "\n" +
                CanonicalUri(request) + "\n" +
                CanonicalQueryParameters(request) + "\n" +
                CanonicalHeaders(request) + "\n" +
                "\n" +
                SignedHeaders(request) + "\n" +
                hashAlgorithm.Hash(request.Content != null ? await request.Content.ReadAsStringAsync() : string.Empty);

        public static async Task<string> ToHashedCanonicalRequestAsync(this HttpRequestMessage request, HashAlgorithm hashAlgorithm = null)
        {
            hashAlgorithm = hashAlgorithm ?? new SHA256Managed();

            return hashAlgorithm.Hash(await request.ToCanonicalRequestAsync(hashAlgorithm));
        }
    }
}