using System;
using System.Threading.Tasks;
using Mcma;

namespace Mcma.Client
{
    public static class ResourceManagerExtensions
    {
        public static Task<T> ResolveResourceFromFullUrl<T>(this IResourceManager resourceManager, string url) where T : McmaResource
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new McmaException("Url must be provided when resolving a resource from a full url.");

            return resourceManager.GetAsync<T>(url);
        }
    }
}