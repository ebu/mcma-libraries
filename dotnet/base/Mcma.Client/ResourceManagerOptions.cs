using System;

namespace Mcma.Client
{
    public class ResourceManagerConfig
    {
        public ResourceManagerConfig(string servicesUrl, string servicesAuthType = null, string servicesAuthContext = null)
        {
            if (servicesUrl == null) throw new ArgumentNullException(nameof(servicesUrl));
            ServicesUrl = servicesUrl;
            ServicesAuthType = servicesAuthType;
            ServicesAuthContext = servicesAuthContext;
        }

        public string ServicesUrl { get; }

        public string ServicesAuthType { get; set; }

        public string ServicesAuthContext { get; set; }
    }
}