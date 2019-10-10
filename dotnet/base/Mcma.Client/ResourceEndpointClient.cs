using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Client
{
    public class ResourceEndpointClient
    {
        internal ResourceEndpointClient(ResourceEndpoint resourceEndpoint,
                                        IAuthProvider authProvider,
                                        string serviceAuthType,
                                        string serviceAuthContext)
        {
            HttpEndpoint = resourceEndpoint?.HttpEndpoint ?? throw new ArgumentNullException(nameof(resourceEndpoint));

            var authType = !string.IsNullOrWhiteSpace(resourceEndpoint.AuthType) ? resourceEndpoint.AuthType : serviceAuthType;
            var authContext = !string.IsNullOrWhiteSpace(resourceEndpoint.AuthContext) ? resourceEndpoint.AuthContext : serviceAuthContext;

            HttpClientTask =
                new Lazy<Task<McmaHttpClient>>(async () =>
                {
                    var authenticator = authProvider != null ? await authProvider.GetAsync(authType, authContext) : null;

                    return new McmaHttpClient(authenticator, HttpEndpoint);
                });
        }

        public string HttpEndpoint { get; }

        private Lazy<Task<McmaHttpClient>> HttpClientTask { get; }

        private async Task<HttpResponseMessage> ExecuteAsync(Func<McmaHttpClient, Task<HttpResponseMessage>> execute)
            => await execute(await HttpClientTask.Value);

        private async Task<T> ExecuteObjectAsync<T>(Func<McmaHttpClient, Task<HttpResponseMessage>> execute) where T : McmaResource
        {
            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return await response.Content.ReadAsObjectFromJsonAsync<T>();
        }

        private async Task<T[]> ExecuteCollectionAsync<T>(Func<McmaHttpClient, Task<HttpResponseMessage>> execute, bool throwIfAnyFailToDeserialize)
        {
            var response = await ExecuteAsync(execute);
            await response.ThrowIfFailedAsync();
            return await response.Content.ReadAsArrayFromJsonAsync<T>(throwIfAnyFailToDeserialize);
        }

        public async Task<HttpResponseMessage> GetAsync(string url = null)
            => await ExecuteAsync(async httpClient => await httpClient.GetAsync(url));

        public async Task<T> GetAsync<T>(string url = null) where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.GetAsync(url));

        public async Task<IEnumerable<T>> GetCollectionAsync<T>(string url = null, IDictionary<string, string> filter = null, bool throwIfAnyFailToDeserialize = true)
            => await ExecuteCollectionAsync<T>(async httpClient => await httpClient.GetAsync(url, filter), throwIfAnyFailToDeserialize);

        public async Task<HttpResponseMessage> PostAsync(object body, string url = null)
            => await ExecuteAsync(async httpClient => await httpClient.PostAsJsonAsync(url, body));

        public async Task<T> PostAsync<T>(T body, string url = null) where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PostAsJsonAsync(url, body));

        public async Task<HttpResponseMessage> PutAsync(object body, string url = null)
            => await ExecuteAsync(async httpClient => await httpClient.PutAsJsonAsync(GetUrl(url, body), body));

        public async Task<T> PutAsync<T>(T body, string url = null) where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PutAsJsonAsync(GetUrl(url, body), body));

        public async Task<HttpResponseMessage> PatchAsync(object body, string url = null)
            => await ExecuteAsync(async httpClient => await httpClient.PatchAsJsonAsync(GetUrl(url, body), body));

        public async Task<T> PatchAsync<T>(T body, string url = null) where T : McmaResource
            => await ExecuteObjectAsync<T>(async httpClient => await httpClient.PatchAsJsonAsync(GetUrl(url, body), body));

        public async Task<HttpResponseMessage> DeleteAsync(string url = null)
            => await ExecuteAsync(async httpClient => await httpClient.DeleteAsync(url));

        private static string GetUrl(string url, object body)
            => body is McmaResource mcmaResource && !string.IsNullOrWhiteSpace(mcmaResource.Id) && string.IsNullOrWhiteSpace(url)
                ? mcmaResource.Id
                : url;
    }
}