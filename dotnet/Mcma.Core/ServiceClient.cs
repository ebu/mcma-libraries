using System.Collections.Generic;
using System.Linq;

namespace Mcma.Core
{
    public class ServiceClient
    {
        public ServiceClient(Service service, IMcmaAuthenticatorProvider authProvider = null)
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

        public bool HasResourceEndpoint(string resourceType)
            => ResourcesByType.ContainsKey(resourceType);

        public bool HasResourceEndpoint<T>()
            => HasResourceEndpoint(typeof(T).Name);

        public ResourceEndpointClient GetResourceEndpoint(string resourceType)
            => ResourcesByType.ContainsKey(resourceType) ? ResourcesByType[resourceType] : null;
            

        public ResourceEndpointClient GetResourceEndpoint<T>()
            => GetResourceEndpoint(typeof(T).Name);
    }
}