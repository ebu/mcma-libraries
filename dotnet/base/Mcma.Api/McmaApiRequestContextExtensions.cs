using System.Net;
using Mcma.Core;
using Mcma.Core.ContextVariables;
using Mcma.Core.Serialization;

namespace Mcma.Api
{
    public static class McmaApiRequestContextExtensions
    {
        public static string PublicUrl(this IContextVariableProvider contextVariableProvider)
            => contextVariableProvider.GetRequiredContextVariable(nameof(PublicUrl));
        
        public static string WorkerFunctionId(this IContextVariableProvider contextVariableProvider)
            => contextVariableProvider.GetRequiredContextVariable(nameof(WorkerFunctionId));

        public static void SetResponseBadRequestDueToMissingBody(this McmaApiRequestContext requestContext)
            => requestContext.SetResponseStatusCode(HttpStatusCode.BadRequest, "Missing request body.");

        public static void SetResponseResourceCreated(this McmaApiRequestContext requestContext, McmaResource resource)
        {
            requestContext.SetResponseStatusCode(HttpStatusCode.Created);
            requestContext.SetResponseHeader("Location", resource.Id);
            requestContext.SetResponseBody(resource);
        }

        public static void SetResponseResourceNotFound(this McmaApiRequestContext requestContext)
            => requestContext.SetResponseStatusCode(HttpStatusCode.NotFound, "No resource found on path '" + requestContext.Request.Path + "'.");
    }
}