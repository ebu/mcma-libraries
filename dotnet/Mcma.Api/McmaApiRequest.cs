using System.Collections.Generic;
using Mcma.Core;
using Newtonsoft.Json.Linq;

namespace Mcma.Api
{
    public class McmaApiRequest
    {
        public string Path { get; set; }

        public string HttpMethod { get; set; }
                
        public IDictionary<string, string> Headers { get; set; }
        
        public IDictionary<string, object> PathVariables { get; set; }

        public IDictionary<string, string> QueryStringParameters { get; set; }

        public string Body { get; set; }

        public JToken JsonBody { get; set; }
    }
}