using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Serialization;
using Mcma.Core.Logging;
using System.Net.Http;

namespace Mcma.Client
{
    public class ResourceManager
    {
        public ResourceManager(ResourceManagerConfig options, IAuthProvider authProvider = null)
            : this(new HttpClient(), options, authProvider)
        {

        }

        public ResourceManager(HttpClient httpClient, ResourceManagerConfig options, IAuthProvider authProvider = null)
        {
            if (httpClient == null) throw new ArgumentNullException(nameof(httpClient));
            if (options == null) throw new ArgumentNullException(nameof(options));

            HttpClient = httpClient;
            Options = options;
            AuthProvider = authProvider;

            McmaHttpClient = new McmaHttpClient(HttpClient);
        }

        private ResourceManagerConfig Options { get; }

        private IAuthProvider AuthProvider { get; }

        private List<ServiceClient> Services { get; } = new List<ServiceClient>();

        private HttpClient HttpClient { get; }

        private McmaHttpClient McmaHttpClient { get; }

        private ServiceClient GetDefaultServiceRegistryServiceClient() =>
            new ServiceClient(
                HttpClient,
                new Service
                {
                    Name = "Service Registry",
                    AuthType = Options.ServicesAuthType,
                    AuthContext = Options.ServicesAuthContext,
                    Resources = new List<ResourceEndpoint>
                    {
                        new ResourceEndpoint
                        {
                            ResourceType = nameof(Service),
                            HttpEndpoint = Options.ServicesUrl
                        }
                    }
                },
                AuthProvider
            );

        public ServiceClient GetServiceClient(Service service) => new ServiceClient(HttpClient, service, AuthProvider);

        public async Task InitAsync()
        {
            try
            {
                Services.Clear();

                var serviceRegistry = GetDefaultServiceRegistryServiceClient();
                Services.Add(serviceRegistry);

                var servicesEndpoint = serviceRegistry.GetResourceEndpointClient<Service>();

                var response = await servicesEndpoint.GetCollectionAsync<Service>(throwIfAnyFailToDeserialize: false);

                Services.AddRange(response.Select(GetServiceClient));
            }
            catch (Exception error)
            {
                throw new Exception("ResourceManager: Failed to initialize", error);
            }
        }
        
        public Task<IEnumerable<T>> QueryAsync<T>(params (string, string)[] filter) => QueryAsync<T>(null, filter);

        public async Task<IEnumerable<T>> QueryAsync<T>(McmaTracker tracker, params (string, string)[] filter)
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpointClients = Services.Where(s => s.HasResourceEndpointClient<T>()).Select(s => s.GetResourceEndpointClient<T>()).ToList();
            if (!resourceEndpointClients.Any())
                throw new Exception($"There are no available resource endpoints for resource of type '{typeof(T)}'");

            var results = new List<T>();
            var usedHttpEndpoints = new List<string>();
            var exceptions = new List<Exception>();

            foreach (var resourceEndpoint in resourceEndpointClients)
            {
                if (usedHttpEndpoints.Contains(resourceEndpoint.HttpEndpoint, StringComparer.OrdinalIgnoreCase))
                    continue;

                try
                {
                    results.AddRange(await resourceEndpoint.GetCollectionAsync<T>(filter: filter.ToDictionary(x => x.Item1, x => x.Item2), tracker: tracker));
                    
                    usedHttpEndpoints.Add(resourceEndpoint.HttpEndpoint);
                }
                catch (Exception error)
                {
                    var message = "Failed to retrieve '" + typeof(T).Name + "' from endpoint '" + resourceEndpoint.HttpEndpoint + "'";
                    Logger.System.Error(message, error);
                    exceptions.Add(new Exception(message, error));
                }
            }

            if (exceptions.Any())
                throw new AggregateException($"Failed to query any available resource endpoints for resource type '{typeof(T)}'", exceptions);

            return new ReadOnlyCollection<T>(results);
        }

        public Task<IEnumerable<McmaResource>> QueryAsync(Type resourceType, params (string, string)[] filter) => QueryAsync(resourceType, null, filter);

        public async Task<IEnumerable<McmaResource>> QueryAsync(Type resourceType, McmaTracker tracker, params (string, string)[] filter)
        {
            if (!Services.Any())
                await InitAsync();

            var results = new List<McmaResource>();
            var usedHttpEndpoints = new Dictionary<string, bool>();

            foreach (var resourceEndpoint in Services.Where(s => s.HasResourceEndpointClient(resourceType)).Select(s => s.GetResourceEndpointClient(resourceType)))
            {
                try
                {
                    if (!usedHttpEndpoints.ContainsKey(resourceEndpoint.HttpEndpoint))
                    {
                        var response = await resourceEndpoint.GetCollectionAsync(resourceType, filter: filter.ToDictionary(x => x.Item1, x => x.Item2), tracker: tracker);
                        results.AddRange(response);
                    }

                    usedHttpEndpoints[resourceEndpoint.HttpEndpoint] = true;
                }
                catch (Exception error)
                {
                    Logger.System.Error("Failed to retrieve '" + resourceType.Name + "' from endpoint '" + resourceEndpoint.HttpEndpoint + "'", error);
                }
            }

            return new ReadOnlyCollection<McmaResource>(results);
        }

        public async Task<T> CreateAsync<T>(T resource, McmaTracker tracker = null) where T : McmaResource
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient<T>())
                    .Select(s => s.GetResourceEndpointClient<T>())
                    .FirstOrDefault();
            if (resourceEndpoint != null)
                return await resourceEndpoint.PostAsync<T>(resource, tracker: tracker);

            if (string.IsNullOrWhiteSpace(resource.Id))
                throw new Exception($"There is no endpoint available for creating resources of type '{typeof(T).Name}', and the provided resource does not specify an endpoint in its 'id' property.");

            var resp = await McmaHttpClient.PostAsJsonAsync(resource.Id, resource, tracker: tracker);
            await resp.ThrowIfFailedAsync();
            return await resp.Content.ReadAsObjectFromJsonAsync<T>();
        }

        public async Task<McmaResource> CreateAsync(Type resourceType, McmaResource resource, McmaTracker tracker = null)
        {
            if (!resourceType.IsInstanceOfType(resource))
                throw new Exception($"Cannot update resource of type '{resourceType.Name}' with object of type '{resource?.GetType().Name ?? "(null)"}'.");

            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient(resourceType))
                    .Select(s => s.GetResourceEndpointClient(resourceType))
                    .FirstOrDefault();
            if (resourceEndpoint != null)
                return await resourceEndpoint.PostAsync(resourceType, resource, tracker: tracker);

            if (string.IsNullOrWhiteSpace(resource.Id))
                throw new Exception($"There is no endpoint available for creating resources of type '{resourceType.Name}', and the provided resource does not specify an endpoint in its 'id' property.");

            var resp = await McmaHttpClient.PostAsJsonAsync(resource.Id, resource, tracker: tracker);
            await resp.ThrowIfFailedAsync();
            return (McmaResource) await resp.Content.ReadAsObjectFromJsonAsync(resourceType);
        }

        public async Task<T> UpdateAsync<T>(T resource, McmaTracker tracker = null) where T : McmaResource
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient<T>())
                    .Select(s => s.GetResourceEndpointClient<T>())
                    .FirstOrDefault(re => resource.Id.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
            if (resourceEndpoint != null)
                return await resourceEndpoint.PutAsync<T>(resource, tracker: tracker);

            var resp = await McmaHttpClient.PutAsJsonAsync(resource.Id, resource, tracker: tracker);
            await resp.ThrowIfFailedAsync();
            return await resp.Content.ReadAsObjectFromJsonAsync<T>();
        }

        public async Task<McmaResource> UpdateAsync(Type resourceType, McmaResource resource, McmaTracker tracker = null)
        {
            if (!resourceType.IsInstanceOfType(resource))
                throw new Exception($"Cannot update resource of type '{resourceType.Name}' with object of type '{resource?.GetType().Name ?? "(null)"}'.");

            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient(resourceType))
                    .Select(s => s.GetResourceEndpointClient(resourceType))
                    .FirstOrDefault(re => resource.Id.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
            if (resourceEndpoint != null)
                return await resourceEndpoint.PutAsync(resourceType, resource, tracker: tracker);

            var resp = await McmaHttpClient.PutAsJsonAsync(resource.Id, resource, tracker: tracker);
            await resp.ThrowIfFailedAsync();
            return (McmaResource) await resp.Content.ReadAsObjectFromJsonAsync(resourceType);
        }

        public Task DeleteAsync(McmaResource resource, McmaTracker tracker = null) => DeleteAsync(resource.Type, resource.Id, tracker: tracker);

        public Task DeleteAsync<T>(string resourceId, McmaTracker tracker = null) => DeleteAsync(typeof(T).Name, resourceId, tracker: tracker);

        private async Task DeleteAsync(string type, string resourceId, McmaTracker tracker)
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient(type))
                    .Select(s => s.GetResourceEndpointClient(type))
                    .FirstOrDefault(re => resourceId.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
                    
            var resp =
                resourceEndpoint != null
                    ? await resourceEndpoint.DeleteAsync(resourceId, tracker: tracker)
                    : await McmaHttpClient.DeleteAsync(resourceId, tracker: tracker);

            await resp.ThrowIfFailedAsync();
        }

        public async Task<ResourceEndpointClient> GetResourceEndpointAsync(string url)
        {
            if (!Services.Any())
                await InitAsync();

            if (string.IsNullOrWhiteSpace(url))
                return null;

            return Services.SelectMany(s => s.Resources)
                .FirstOrDefault(re => url.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<T> GetAsync<T>(string url, McmaTracker tracker = null) where T : McmaResource
        {
            var resourceEndpoint = await GetResourceEndpointAsync(url);

            return resourceEndpoint != null
                ? await resourceEndpoint.GetAsync<T>(url, tracker: tracker)
                : await McmaHttpClient.GetAndReadAsObjectFromJsonAsync<T>(url, tracker: tracker);
        }

        public async Task<McmaResource> GetAsync(Type resourceType, string url, McmaTracker tracker = null)
        {
            var resourceEndpoint = await GetResourceEndpointAsync(url);

            return resourceEndpoint != null
                ? await resourceEndpoint.GetAsync(resourceType, url, tracker: tracker)
                : (McmaResource) await McmaHttpClient.GetAndReadAsObjectFromJsonAsync(resourceType, url, tracker: tracker);
        }

        public async Task SendNotificationAsync<T>(T resource, NotificationEndpoint notificationEndpoint, McmaTracker tracker = null) where T : McmaResource
        {
            if (string.IsNullOrWhiteSpace(notificationEndpoint?.HttpEndpoint))
                return;

            // create a notification from the provided resource
            var notification = new Notification {Source = resource.Id, Content = resource.ToMcmaJson()};

            // get the resource endpoint for the notification url
            var resourceEndpoint = await GetResourceEndpointAsync(notificationEndpoint.HttpEndpoint);

            // send the notification via the ResourceEndpointClient, if found, or just via regular http otherwise
            var response =
                resourceEndpoint != null
                    ? await resourceEndpoint.PostAsync((object)notification, notificationEndpoint.HttpEndpoint, tracker: tracker)
                    : await McmaHttpClient.PostAsJsonAsync(notificationEndpoint.HttpEndpoint, notification, tracker: tracker);

            // ensure that the notification was sent successfully
            await response.ThrowIfFailedAsync();
        }
    }
}