using System;
using System.Threading.Tasks;
using Mcma.Core;

namespace Mcma.Client
{
    public static class ResourceManagerExtensions
    {
        public static Task<T> ResolveResourceFromFullUrl<T>(this ResourceManager resourceManager, string url) where T : McmaResource
        {
            if (string.IsNullOrWhiteSpace(url))
                throw new Exception($"Url must be provided when resolving a resource from a full url.");

            return resourceManager.ResolveAsync<T>(url);
        }
    }
}