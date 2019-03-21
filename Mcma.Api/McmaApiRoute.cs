using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing.Template;

namespace Mcma.Api
{
    internal class McmaApiRoute<TRequest> where TRequest : McmaApiRequest
    {
        public McmaApiRoute(string httpMethod, string path, Func<TRequest, McmaApiResponse, Task> handler)
        {
            HttpMethod = httpMethod;
            Path = path;
            Handler = handler;

            Template = new TemplateMatcher(TemplateParser.Parse(path), null);
        }

        public string HttpMethod { get; }

        public string Path { get; }

        public TemplateMatcher Template { get; }
        
        public Func<TRequest, McmaApiResponse, Task> Handler { get; }
    }
}