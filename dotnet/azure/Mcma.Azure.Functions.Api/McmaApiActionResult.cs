using System.Threading.Tasks;
using Mcma.Api;
using Microsoft.AspNetCore.Mvc;

namespace Mcma.Azure.Functions.Api
{
    public class McmaApiActionResult : ActionResult
    {
        public McmaApiActionResult(McmaApiResponse response)
        {
            Response = response;
        }

        private McmaApiResponse Response { get; }

        public override Task ExecuteResultAsync(ActionContext context) => Response.CopyToHttpResponseAsync(context.HttpContext.Response);
    }
}
