using System;
using System.Threading.Tasks;

namespace Mcma.Core
{
    public static class ResourceManagerExtensions
    {
        public static Task<T> ResolveResourceFromFullUrl<T>(this ResourceManager resourceManager, string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new Exception($"Url must be provided when resolving a resource from a full url.");

            return resourceManager.ResolveAsync<T>(url);
        }
    }
}