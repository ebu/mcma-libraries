using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing.Template;

namespace Mcma.Api.Routes
{
    public class McmaApiRoute
    {
        public McmaApiRoute(string httpMethod, string path, Func<McmaApiRequestContext, Task> handler)
            : this(new HttpMethod(httpMethod), path, handler)
        {
        }

        public McmaApiRoute(HttpMethod httpMethod, string path, Func<McmaApiRequestContext, Task> handler)
        {
            HttpMethod = httpMethod;
            Path = path;
            Handler = handler;

            Template = new TemplateMatcher(TemplateParser.Parse(path), null);
        }

        public HttpMethod HttpMethod { get; }

        public string Path { get; }

        public TemplateMatcher Template { get; }
        
        public Func<McmaApiRequestContext, Task> Handler { get; }
    }
}