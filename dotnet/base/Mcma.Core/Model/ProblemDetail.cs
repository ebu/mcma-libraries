using Newtonsoft.Json;

namespace Mcma
{
    public class ProblemDetail : McmaObject
    {
        [JsonProperty("type")]
        public string ProblemType { get; set; }

        public string Title { get; set;}

        public string Detail { get; set; }

        public string Instance { get; set; }
        
        public string StackTrace { get; set; }
    }
}