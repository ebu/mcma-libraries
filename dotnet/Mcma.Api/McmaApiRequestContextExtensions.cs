using System.Net;
using Mcma.Core;
using Mcma.Core.Serialization;

namespace Mcma.Api
{
    public static class McmaApiRequestContextExtensions
    {
        public static string PublicUrl(this McmaApiRequestContext requestContext)
            => requestContext.ContextVariables.TryGetValue(nameof(PublicUrl), out var publicUrl) ? publicUrl : string.Empty;
        
        public static string TableName(this McmaApiRequestContext requestContext)
            => requestContext.ContextVariables.TryGetValue(nameof(TableName), out var tableName) ? tableName : string.Empty;

        public static string WorkerFunctionName(this McmaApiRequestContext requestContext)
            => requestContext.ContextVariables.TryGetValue(nameof(WorkerFunctionName), out var workerLambdaFunctionName)
                ? workerLambdaFunctionName
                : string.Empty;

        public static bool IsBadRequestDueToMissingBody<TResource>(this McmaApiRequestContext requestContext, out TResource resource)
            where TResource : McmaResource
        {
            resource = requestContext.Request?.JsonBody?.ToMcmaObject<TResource>();
            if (resource == null)
            {
                requestContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                requestContext.Response.StatusMessage = "Missing request body.";
                return true;
            }

            return false;
        }

        public static void ResourceCreated(this McmaApiRequestContext requestContext, McmaResource resource)
        {
            requestContext.Response.StatusCode = (int)HttpStatusCode.Created;
            requestContext.Response.Headers["Location"] = resource.Id;
            requestContext.Response.JsonBody = resource.ToMcmaJson();
        }

        public static bool ResourceIfFound(this McmaApiRequestContext requestContext, object resource, bool setBody = true)
        {
            if (resource == null)
            {
                requestContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                requestContext.Response.StatusMessage = "No resource found on path '" + requestContext.Request.Path + "'.";
                return false;
            }
            
            if (setBody)
                requestContext.Response.JsonBody = resource.ToMcmaJson();

            return true;
        }
    }
}