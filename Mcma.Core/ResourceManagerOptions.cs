using System;

namespace Mcma.Core
{
    public class ResourceManagerOptions
    {
        public ResourceManagerOptions(string servicesUrl)
        {
            if (servicesUrl == null) throw new ArgumentNullException(nameof(servicesUrl));
            ServicesUrl = servicesUrl;
        }

        public string ServicesUrl { get; }

        public string ServicesAuthType { get; private set; }

        public string ServicesAuthContext { get; private set; }

        public IMcmaAuthenticatorProvider AuthProvider { get; private set; }

        public ResourceManagerOptions WithAuth(IMcmaAuthenticatorProvider authProvider, string servicesAuthType = null, string servicesAuthContext = null)
        {
            AuthProvider = authProvider;
            ServicesAuthType = servicesAuthType;
            ServicesAuthContext = servicesAuthContext;
            return this;
        }
    }
}