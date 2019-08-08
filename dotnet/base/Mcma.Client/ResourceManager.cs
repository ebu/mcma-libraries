using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Serialization;
using Mcma.Core.Logging;

namespace Mcma.Client
{
    public class ResourceManager
    {
        public ResourceManager(ResourceManagerConfig options, IAuthProvider authProvider = null)
        {
            if (options == null) throw new ArgumentNullException(nameof(options));

            Options = options;
            AuthProvider = authProvider;
        }

        private ResourceManagerConfig Options { get; }

        private IAuthProvider AuthProvider { get; }

        private List<ServiceClient> Services { get; } = new List<ServiceClient>();

        private McmaHttpClient HttpClient { get; } = new McmaHttpClient();

        private ServiceClient GetDefaultServiceRegistryServiceClient() =>
            new ServiceClient(
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

        public async Task InitAsync()
        {
            try
            {
                Services.Clear();

                var serviceRegistry = GetDefaultServiceRegistryServiceClient();
                Services.Add(serviceRegistry);

                var servicesEndpoint = serviceRegistry.GetResourceEndpoint<Service>();

                Logger.Debug($"Retrieving services from {Options.ServicesUrl}...");

                var response = await servicesEndpoint.GetCollectionAsync<Service>(throwIfAnyFailToDeserialize: false);

                Services.AddRange(response.Select(svc => new ServiceClient(svc, AuthProvider)));
            }
            catch (Exception error)
            {
                throw new Exception("ResourceManager: Failed to initialize", error);
            }
        }

        public async Task<IEnumerable<T>> GetAsync<T>(params (string, string)[] filter)
        {
            if (!Services.Any())
                await InitAsync();

            var results = new List<T>();
            var usedHttpEndpoints = new Dictionary<string, bool>();

            foreach (var resourceEndpoint in Services.Where(s => s.HasResourceEndpointClient<T>()).Select(s => s.GetResourceEndpoint<T>()))
            {
                try
                {
                    if (!usedHttpEndpoints.ContainsKey(resourceEndpoint.HttpEndpoint))
                    {
                        var response = await resourceEndpoint.GetCollectionAsync<T>(filter: filter.ToDictionary(x => x.Item1, x => x.Item2));
                        results.AddRange(response);
                    }

                    usedHttpEndpoints[resourceEndpoint.HttpEndpoint] = true;
                }
                catch (Exception error)
                {
                    Logger.Error("Failed to retrieve '" + typeof(T).Name + "' from endpoint '" + resourceEndpoint.HttpEndpoint + "'");
                    Logger.Exception(error);
                }
            }

            return new ReadOnlyCollection<T>(results);
        }

        public async Task<T> CreateAsync<T>(T resource)
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint = Services.Where(s => s.HasResourceEndpointClient<T>()).Select(s => s.GetResourceEndpoint<T>()).FirstOrDefault();
            if (resourceEndpoint != null)
                return await resourceEndpoint.PostAsync<T>(resource);

            throw new Exception("ResourceManager: Failed to find service to create resource of type '" + typeof(T).Name + "'.");
        }

        public async Task<T> UpdateAsync<T>(T resource) where T : McmaResource
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient<T>())
                    .Select(s => s.GetResourceEndpoint<T>())
                    .FirstOrDefault(re => resource.Id.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
            if (resourceEndpoint != null)
                return await resourceEndpoint.PutAsync<T>(resource);

            var resp = await HttpClient.PutAsJsonAsync(resource.Id, resource);
            return await resp.Content.ReadAsObjectFromJsonAsync<T>();
        }

        public async Task DeleteAsync(McmaResource resource)
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient(resource.Type))
                    .Select(s => s.GetResourceEndpointClient(resource.Type))
                    .FirstOrDefault(re => resource.Id.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
            if (resourceEndpoint != null)
                await resourceEndpoint.DeleteAsync(resource.Id);
            else
                await HttpClient.DeleteAsync(resource.Id);
        }

        public async Task DeleteAsync<T>(string resourceId)
        {
            if (!Services.Any())
                await InitAsync();

            var resourceEndpoint =
                Services.Where(s => s.HasResourceEndpointClient(typeof(T).Name))
                    .Select(s => s.GetResourceEndpointClient(typeof(T).Name))
                    .FirstOrDefault(re => resourceId.StartsWith(re.HttpEndpoint, StringComparison.OrdinalIgnoreCase));
            if (resourceEndpoint != null)
                await resourceEndpoint.DeleteAsync(resourceId);
            else
                await HttpClient.DeleteAsync(resourceId);
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

        public async Task<T> ResolveAsync<T>(string url)
        {
            var resourceEndpoint = await GetResourceEndpointAsync(url);

            return resourceEndpoint != null
                ? await resourceEndpoint.GetAsync<T>(url)
                : await HttpClient.GetAndReadAsObjectFromJsonAsync<T>(url);
        }

        public async Task SendNotificationAsync<T>(T resource, NotificationEndpoint notificationEndpoint) where T : McmaResource
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
                    ? await resourceEndpoint.PostAsync((object)notification, notificationEndpoint.HttpEndpoint)
                    : await HttpClient.PostAsJsonAsync(notificationEndpoint.HttpEndpoint, notification);

            // ensure that the notification was sent successfully
            await response.ThrowIfFailedAsync();
        }
    }
}