using System;
using System.Collections.Generic;

namespace Mcma
{
    public class Service : McmaResource
    {
        public string Name { get; set; }

        public string AuthType { get; set; }

        public string AuthContext { get; set; }

        public ICollection<ResourceEndpoint> Resources { get; set; }

        public string JobType { get; set; }

        public string[] JobProfiles { get; set; }

        public ICollection<Locator> InputLocations { get; set; }

        public ICollection<Locator> OutputLocations { get; set; }
    }
}
