using Newtonsoft.Json.Linq;

namespace Mcma.Core
{
    public class Notification : McmaResource
    {
        public string Source { get; set; }

        public JToken Content { get; set; }
    }
}