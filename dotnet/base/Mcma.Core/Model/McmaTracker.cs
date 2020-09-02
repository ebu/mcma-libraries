using System.Collections.Generic;

namespace Mcma
{
    public class McmaTracker : McmaObject
    {
        public string Id { get; set; }

        public string Label { get; set; }

        public IDictionary<string, string> Custom { get; set; }
    }
}