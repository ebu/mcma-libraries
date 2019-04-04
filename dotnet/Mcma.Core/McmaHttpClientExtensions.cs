using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mcma.Core.Serialization;
using System.Collections.Generic;

namespace Mcma.Core
{

    public static class McmaHttpClientExtensions
    {
        public static async Task<HttpResponseMessage> WithErrorHandling(this Task<HttpResponseMessage> responseTask)
            => await (await responseTask).ThrowIfFailedAsync();

        public static async Task<T> ReadAsObjectFromJsonAsync<T>(this Task<HttpResponseMessage> responseTask)
            => await (await responseTask.WithErrorHandling()).Content.ReadAsObjectFromJsonAsync<T>();

        public static async Task<T[]> ReadAsArrayFromJsonAsync<T>(this Task<HttpResponseMessage> responseTask)
            => await (await responseTask.WithErrorHandling()).Content.ReadAsArrayFromJsonAsync<T>();

        public static async Task<HttpResponseMessage> PostAsJsonAsync(this McmaHttpClient client, string url, object body)
            => await client.PostAsync(url, new StringContent(body.ToMcmaJson().ToString(), Encoding.UTF8, "application/json"));

        public static async Task<HttpResponseMessage> PutAsJsonAsync(this McmaHttpClient client, string url, object body)
            => await client.PutAsync(url, new StringContent(body.ToMcmaJson().ToString(), Encoding.UTF8, "application/json"));

        public static async Task<HttpResponseMessage> PatchAsJsonAsync(this McmaHttpClient client, string url, object body)
            => await client.PatchAsync(url, new StringContent(body.ToMcmaJson().ToString(), Encoding.UTF8, "application/json"));

        public static async Task<T> GetAndReadAsObjectFromJsonAsync<T>(this McmaHttpClient client,
                                                                       string url,
                                                                       IDictionary<string, string> queryParams = null,
                                                                       IDictionary<string, string> headers = null)
            =>
                await (await client.GetAsync(url, queryParams, headers).WithErrorHandling()).Content.ReadAsObjectFromJsonAsync<T>();

        public static async Task<T[]> GetAndReadAsArrayFromJsonAsync<T>(this McmaHttpClient client,
                                                                        string url,
                                                                        IDictionary<string, string> queryParams = null,
                                                                        IDictionary<string, string> headers = null)
            => await client.GetAsync(url, queryParams, headers).ReadAsArrayFromJsonAsync<T>();
    }
}