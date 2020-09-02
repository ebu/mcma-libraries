using System.Collections.Generic;
using System.Net.Http;
using Mcma;
using Newtonsoft.Json.Linq;

namespace Mcma.Api
{
    public class McmaApiRequest
    {
        public string Id { get; set; }

        public string Path { get; set; }

        public HttpMethod HttpMethod { get; set; }

        public IDictionary<string, string> Headers { get; set; }

        public IDictionary<string, object> PathVariables { get; set; }

        public IDictionary<string, string> QueryStringParameters { get; set; }

        public string Body { get; set; }

        public JToken JsonBody { get; set; }
    }
}