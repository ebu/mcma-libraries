using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Mcma.Api
{
    public class McmaApiResponse
    {
        public int StatusCode { get; set; }

        public string StatusMessage { get; set; }

        public IDictionary<string, string> Headers { get; set; }

        public string Body { get; set; }

        public JToken JsonBody { get; set; }
    }
}