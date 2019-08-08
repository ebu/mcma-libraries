using System.Collections.Generic;
using System.Linq;
using Mcma.Core;

namespace Mcma.Client
{
    public class ServiceClient
    {
        public ServiceClient(Service service, IAuthProvider authProvider = null)
        {
            Data = service;

            ResourcesByType =
                service.Resources != null
                    ? service.Resources.ToDictionary(r => r.ResourceType, r => new ResourceEndpointClient(r, authProvider, service.AuthType, service.AuthContext))
                    : new Dictionary<string, ResourceEndpointClient>();
        }

        public Service Data { get; }

        private IDictionary<string, ResourceEndpointClient> ResourcesByType { get; }

        public IEnumerable<ResourceEndpointClient> Resources => ResourcesByType.Values;

        public bool HasResourceEndpointClient(string resourceType)
            => ResourcesByType.ContainsKey(resourceType);

        public bool HasResourceEndpointClient<T>()
            => HasResourceEndpointClient(typeof(T).Name);

        public ResourceEndpointClient GetResourceEndpointClient(string resourceType)
            => ResourcesByType.ContainsKey(resourceType) ? ResourcesByType[resourceType] : null;
            
        public ResourceEndpointClient GetResourceEndpoint<T>()
            => GetResourceEndpointClient(typeof(T).Name);

        public ResourceEndpointClient[] GetAllResourceEndpointClients()
            => ResourcesByType.Values.ToArray();
    }
}