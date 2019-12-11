using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Serialization;
using Mcma.Core.Utility;

namespace Mcma.Client
{
    public class McmaHttpClient
    {
        public McmaHttpClient(HttpClient httpClient, IAuthenticator authenticator = null, string baseUrl = null)
        {
            HttpClient = httpClient ?? new HttpClient();
            Authenticator = authenticator;
            BaseUrl = baseUrl;
        }

        private HttpClient HttpClient { get; }

        public IAuthenticator Authenticator { get; internal set; }

        private string BaseUrl { get; }

        public Task<HttpResponseMessage> GetAsync(string url,
                                                  IDictionary<string, string> queryParams = null,
                                                  IDictionary<string, string> headers = null,
                                                  McmaTracker tracker = null)
            => SendAsync(WithQueryParams(url, queryParams), HttpMethod.Get, headers, tracker, null);

        public Task<HttpResponseMessage> PostAsync(string url, HttpContent body, IDictionary<string, string> headers = null, McmaTracker tracker = null)
            => SendAsync(url, HttpMethod.Post, headers, tracker, body);

        public Task<HttpResponseMessage> PutAsync(string url, HttpContent body, IDictionary<string, string> headers = null, McmaTracker tracker = null)
            => SendAsync(url, HttpMethod.Put, headers, tracker, body);

        public Task<HttpResponseMessage> PatchAsync(string url, HttpContent body, IDictionary<string, string> headers = null, McmaTracker tracker = null)
            => SendAsync(url, new HttpMethod("PATCH"), headers, tracker, body);

        public Task<HttpResponseMessage> DeleteAsync(string url, IDictionary<string, string> headers = null, McmaTracker tracker = null)
            => SendAsync(url, HttpMethod.Delete, headers, tracker, null);

        private string WithQueryParams(string url, IDictionary<string, string> queryParams)
            => queryParams != null && queryParams.Any()
                ? (url ?? string.Empty) + "?" + string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={kvp.Value}"))
                : url;

        private async Task<HttpResponseMessage> SendAsync(string url, HttpMethod method, IDictionary<string, string> headers, McmaTracker tracker, HttpContent body)
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

            if (tracker != null)
            {
                if (request.Headers.Any(h => h.Key == McmaHeaders.Tracker))
                    request.Headers.Remove(McmaHeaders.Tracker);
                request.Headers.Add(McmaHeaders.Tracker, Convert.ToBase64String(Encoding.UTF8.GetBytes(tracker.ToMcmaJson().ToString())));
            }
            
            if (headers != null)
                foreach (var header in headers)
                    request.Headers.Add(header.Key, header.Value);

            if (body != null)
                request.Content = body;

            if (Authenticator != null)
                await Authenticator.SignAsync(request);

            return await HttpClient.SendAsync(request);
        }
    }
}