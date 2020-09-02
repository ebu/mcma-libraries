using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma;

namespace Mcma.Client
{
    public class ResourceEndpointClient
    {
        internal ResourceEndpointClient(HttpClient httpClient,
                                        IAuthProvider authProvider,
                                        ResourceEndpoint resourceEndpoint,
                                        string serviceAuthType,
                                        object serviceAuthContext)
        {
            HttpClient = httpClient;
            AuthProvider = authProvider;

            HttpEndpoint = resourceEndpoint?.HttpEndpoint ?? throw new ArgumentNullException(nameof(resourceEndpoint));

            AuthType = !string.IsNullOrWhiteSpace(resourceEndpoint.AuthType) ? resourceEndpoint.AuthType : serviceAuthType;

            AuthContext = resourceEndpoint.AuthContext ?? serviceAuthContext;
            HttpClientTask = new Lazy<Task<McmaHttpClient>>(CreateHttpClient);
        }

        private HttpClient HttpClient { get; }

        private IAuthProvider AuthProvider { get; }

        private string AuthType { get; }

        private object AuthContext { get; }

        public string HttpEndpoint { get; }

        private Lazy<Task<McmaHttpClient>> HttpClientTask { get; }

        private async Task<McmaHttpClient> CreateHttpClient()
        {
            var authenticator = AuthProvider != null ? await AuthProvider.GetAsync(AuthType, AuthContext) : null;

            return new McmaHttpClient(HttpClient, authenticator, HttpEndpoint);
        }

        private async Task<HttpResponseMessage> ExecuteAsync(Func<McmaHttpClient, Task<HttpResponseMessage>> execute)
            => await execute(await HttpClientTask.Value);

        private async Task<T> ExecuteObjectAsync<T>(Func<McmaHttpClient, Task<HttpResponseMessage>> execute) where T : McmaResource
        {
            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return await response.Content.ReadAsObjectFromJsonAsync<T>();
        }

        private async Task<McmaResource> ExecuteObjectAsync(Type resourceType, Func<McmaHttpClient, Task<HttpResponseMessage>> execute)
        {
            if (!typeof(McmaResource).IsAssignableFrom(resourceType))
                throw new ArgumentException($"Type '{resourceType}' is not an MCMA resource type.");

            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return (McmaResource)await response.Content.ReadAsObjectFromJsonAsync(resourceType);
        }

        private async Task<T[]> ExecuteCollectionAsync<T>(Func<McmaHttpClient, Task<HttpResponseMessage>> execute, bool throwIfAnyFailToDeserialize)
        {
            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return await response.Content.ReadAsArrayFromJsonAsync<T>(throwIfAnyFailToDeserialize);
        }

        private async Task<McmaResource[]> ExecuteCollectionAsync(Type resourceType, Func<McmaHttpClient, Task<HttpResponseMessage>> execute, bool throwIfAnyFailToDeserialize)
        {
            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return (await response.Content.ReadAsArrayFromJsonAsync(resourceType, throwIfAnyFailToDeserialize)).OfType<McmaResource>().ToArray();
        }

        public async Task<HttpResponseMessage> GetAsync(string url = null,
                                                        IDictionary<string, string> queryParams = null,
                                                        IDictionary<string, string> headers = null,
                                                        McmaTracker tracker = null)
            => await ExecuteAsync(async httpClient => await httpClient.GetAsync(url, queryParams, headers, tracker));

        public async Task<McmaResource> GetAsync(Type resourceType,
                                                 string url = null,
                                                 IDictionary<string, string> queryParams = null,
                                                 IDictionary<string, string> headers = null,
                                                 McmaTracker tracker = null)
            => await ExecuteObjectAsync(resourceType, async httpClient => await httpClient.GetAsync(url, queryParams, headers, tracker));

        public async Task<T> GetAsync<T>(string url = null,
                                         IDictionary<string, string> queryParams = null,
                                         IDictionary<string, string> headers = null,
                                         McmaTracker tracker = null)
            where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.GetAsync(url, queryParams, headers, tracker));

        public async Task<IEnumerable<T>> GetCollectionAsync<T>(string url = null,
                                                                IDictionary<string, string> filter = null,
                                                                IDictionary<string, string> headers = null,
                                                                McmaTracker tracker = null,
                                                                bool throwIfAnyFailToDeserialize = true)
            => await ExecuteCollectionAsync<T>(async httpClient => await httpClient.GetAsync(url, filter, headers, tracker), throwIfAnyFailToDeserialize);

        public async Task<IEnumerable<McmaResource>> GetCollectionAsync(Type resourceType,
                                                                        string url = null,
                                                                        IDictionary<string, string> filter = null,
                                                                        IDictionary<string, string> headers = null,
                                                                        McmaTracker tracker = null,
                                                                        bool throwIfAnyFailToDeserialize = true)
            => await ExecuteCollectionAsync(resourceType, async httpClient => await httpClient.GetAsync(url, filter, headers, tracker), throwIfAnyFailToDeserialize);

        public async Task<HttpResponseMessage> PostAsync(object body,
                                                         string url = null,
                                                         IDictionary<string, string> queryParams = null,
                                                         IDictionary<string, string> headers = null,
                                                         McmaTracker tracker = null)
            => await ExecuteAsync(async httpClient => await httpClient.PostAsJsonAsync(url, body, headers, tracker));

        public async Task<McmaResource> PostAsync(Type resourceType,
                                                  McmaResource body,
                                                  string url = null,
                                                  IDictionary<string, string> queryParams = null,
                                                  IDictionary<string, string> headers = null,
                                                  McmaTracker tracker = null)
            => await ExecuteObjectAsync(resourceType, async httpClient => await httpClient.PostAsJsonAsync(url, body, headers, tracker));

        public async Task<T> PostAsync<T>(T body,
                                          string url = null,
                                          IDictionary<string, string> queryParams = null,
                                          IDictionary<string, string> headers = null,
                                          McmaTracker tracker = null)
            where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PostAsJsonAsync(url, body, headers, tracker));

        public async Task<HttpResponseMessage> PutAsync(object body,
                                                        string url = null,
                                                        IDictionary<string, string> queryParams = null,
                                                        IDictionary<string, string> headers = null,
                                                        McmaTracker tracker = null)
            => await ExecuteAsync(async httpClient => await httpClient.PutAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<McmaResource> PutAsync(Type resourceType,
                                                 McmaResource body,
                                                 string url = null,
                                                 IDictionary<string, string> queryParams = null,
                                                 IDictionary<string, string> headers = null,
                                                 McmaTracker tracker = null)
            => await ExecuteObjectAsync(resourceType, async httpClient => await httpClient.PutAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<T> PutAsync<T>(T body,
                                         string url = null,
                                         IDictionary<string, string> queryParams = null,
                                         IDictionary<string, string> headers = null,
                                         McmaTracker tracker = null)
            where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PutAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<HttpResponseMessage> PatchAsync(object body,
                                                          string url = null,
                                                          IDictionary<string, string> queryParams = null,
                                                          IDictionary<string, string> headers = null,
                                                          McmaTracker tracker = null)
            => await ExecuteAsync(async httpClient => await httpClient.PatchAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<McmaResource> PatchAsync(Type resourceType,
                                                   McmaResource body,
                                                   string url = null,
                                                   IDictionary<string, string> queryParams = null,
                                                   IDictionary<string, string> headers = null,
                                                   McmaTracker tracker = null)
            => await ExecuteObjectAsync(resourceType, async httpClient => await httpClient.PatchAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<T> PatchAsync<T>(T body,
                                           string url = null,
                                           IDictionary<string, string> queryParams = null,
                                           IDictionary<string, string> headers = null,
                                           McmaTracker tracker = null)
            where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PatchAsJsonAsync(GetUrl(url, body), body, headers, tracker));

        public async Task<HttpResponseMessage> DeleteAsync(string url = null,
                                                           IDictionary<string, string> queryParams = null,
                                                           IDictionary<string, string> headers = null,
                                                           McmaTracker tracker = null)
            => await ExecuteAsync(async httpClient => await httpClient.DeleteAsync(url, headers, tracker));

        private static string GetUrl(string url, object body)
            => body is McmaResource mcmaResource && !string.IsNullOrWhiteSpace(mcmaResource.Id) && string.IsNullOrWhiteSpace(url)
                ? mcmaResource.Id
                : url;
    }
}