namespace Mcma
{
    public class ResourceEndpoint : McmaObject
    {
        public string ResourceType { get; set; }

        public string HttpEndpoint { get; set; }

        public string AuthType { get; set; }

        public object AuthContext { get; set; }
    }
}