using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma.Core.Logging;
using Mcma.Core.Utility;

namespace Mcma.Core
{

    public class McmaHttpClient
    {
        public McmaHttpClient(IMcmaAuthenticator authenticator = null, string baseUrl = null)
        {
            HttpClient = authenticator?.CreateAuthenticatedClient() ?? new HttpClient();
            BaseUrl = baseUrl;
        }

        private HttpClient HttpClient { get; }

        private string BaseUrl { get; }

        public Task<HttpResponseMessage> GetAsync(string url, IDictionary<string, string> queryParams = null, IDictionary<string, string> headers = null)
            => SendAsync(WithQueryParams(url, queryParams), HttpMethod.Get, headers, null);

        public Task<HttpResponseMessage> PostAsync(string url, HttpContent body, IDictionary<string, string> headers = null)
            => SendAsync(url, HttpMethod.Post, headers, body);

        public Task<HttpResponseMessage> PutAsync(string url, HttpContent body, IDictionary<string, string> headers = null)
            => SendAsync(url, HttpMethod.Put, headers, body);

        public Task<HttpResponseMessage> PatchAsync(string url, HttpContent body, IDictionary<string, string> headers = null)
            => SendAsync(url, new HttpMethod("PATCH"), headers, body);

        public Task<HttpResponseMessage> DeleteAsync(string url, IDictionary<string, string> headers = null)
            => SendAsync(url, HttpMethod.Delete, headers, null);

        private string WithQueryParams(string url, IDictionary<string, string> queryParams)
            => queryParams != null && queryParams.Any()
                ? (url ?? string.Empty) + "?" + string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={kvp.Value}"))
                : url;

        private Task<HttpResponseMessage> SendAsync(string url, HttpMethod method, IDictionary<string, string> headers, HttpContent body)
        {
            url = url ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(BaseUrl))
            {
                if (string.IsNullOrWhiteSpace(url))
                    url = BaseUrl;
                else if (url.IndexOf("http://") != 0 || url.IndexOf("https://") != 0)
                    url = BaseUrl + url.Replace(BaseUrl, string.Empty, StringComparison.OrdinalIgnoreCase);
                else if (!url.StartsWith(BaseUrl))
                    throw new Exception($"HttpClient: Making " + method + " request to URL '" + url + "' which does not match BaseUrl '" + BaseUrl + "'");
            }

            if (string.IsNullOrWhiteSpace(url))
                throw new Exception("HttpClient: Missing url in request");

            var request = new HttpRequestMessage(method, url);
            
            if (headers != null)
                foreach (var header in headers)
                    request.Headers.Add(header.Key, header.Value);

            if (body != null)
                request.Content = body;

            return HttpClient.SendAsync(request);
        }
    }
}