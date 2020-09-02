using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Mcma.Client
{
    public interface IResourceManager
    {
        ServiceClient GetServiceClient(Service service);

        Task InitAsync();

        Task<IEnumerable<T>> QueryAsync<T>(params (string, string)[] filter);

        Task<IEnumerable<T>> QueryAsync<T>(McmaTracker tracker, params (string, string)[] filter);

        Task<IEnumerable<McmaResource>> QueryAsync(Type resourceType, params (string, string)[] filter);

        Task<IEnumerable<McmaResource>> QueryAsync(Type resourceType, McmaTracker tracker, params (string, string)[] filter);

        Task<T> CreateAsync<T>(T resource, McmaTracker tracker = null) where T : McmaResource;

        Task<McmaResource> CreateAsync(Type resourceType, McmaResource resource, McmaTracker tracker = null);

        Task<T> UpdateAsync<T>(T resource, McmaTracker tracker = null) where T : McmaResource;

        Task<McmaResource> UpdateAsync(Type resourceType, McmaResource resource, McmaTracker tracker = null);

        Task DeleteAsync(McmaResource resource, McmaTracker tracker = null);

        Task DeleteAsync<T>(string resourceId, McmaTracker tracker = null);

        Task<ResourceEndpointClient> GetResourceEndpointAsync(string url);

        Task<T> GetAsync<T>(string url, McmaTracker tracker = null) where T : McmaResource;

        Task<McmaResource> GetAsync(Type resourceType, string url, McmaTracker tracker = null);

        Task SendNotificationAsync<T>(T resource, NotificationEndpoint notificationEndpoint, McmaTracker tracker = null) where T : McmaResource;
    }
}