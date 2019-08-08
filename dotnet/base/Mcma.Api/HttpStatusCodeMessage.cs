using System.Collections.Generic;
using System.Net;

namespace Mcma.Api
{
    public static class HttpStatusCodeMessage
    {
        private static readonly Dictionary<int, string> StatusErrors = new Dictionary<int, string>
        {
            [(int)HttpStatusCode.OK] ="OK",
            [(int)HttpStatusCode.Created] = "Created",
            [(int)HttpStatusCode.Accepted] = "Accepted",
            [(int)HttpStatusCode.NonAuthoritativeInformation] = "Non-Authoritative Information",
            [(int)HttpStatusCode.NoContent] = "No Content",
            [(int)HttpStatusCode.ResetContent] = "Reset Content",
            [(int)HttpStatusCode.PartialContent] = "Partial Content",
            [(int)HttpStatusCode.BadRequest] = "Bad Request",
            [(int)HttpStatusCode.Unauthorized] = "Unauthorized",
            [(int)HttpStatusCode.PaymentRequired] = "Payment Required",
            [(int)HttpStatusCode.Forbidden] = "Forbidden",
            [(int)HttpStatusCode.NotFound] = "Not Found",
            [(int)HttpStatusCode.MethodNotAllowed] = "Method Not Allowed",
            [(int)HttpStatusCode.NotAcceptable] = "Not Acceptable",
            [(int)HttpStatusCode.ProxyAuthenticationRequired] = "Proxy Authentication Required ",
            [(int)HttpStatusCode.RequestTimeout] = "Request Timeout",
            [(int)HttpStatusCode.Conflict] = "Conflict",
            [(int)HttpStatusCode.Gone] = "Gone",
            [(int)HttpStatusCode.LengthRequired] = "Length Required",
            [(int)HttpStatusCode.PreconditionFailed] = "Precondition Failed",
            [(int)HttpStatusCode.RequestEntityTooLarge] = "Payload Too Large",
            [(int)HttpStatusCode.RequestUriTooLong] = "URI Too Long",
            [(int)HttpStatusCode.UnsupportedMediaType] = "Unsupported Media Type",
            [(int)HttpStatusCode.InternalServerError] = "Internal Server Error",
            [(int)HttpStatusCode.NotImplemented] = "Not Implemented",
            [(int)HttpStatusCode.BadGateway] = "Bad Gateway",
            [(int)HttpStatusCode.ServiceUnavailable] = "Service Unavailable",
            [(int)HttpStatusCode.GatewayTimeout] = "Gateway Timeout",
            [(int)HttpStatusCode.HttpVersionNotSupported] = "HTTP Version Not Supported",
        };

        public static string From(int statusCode) => StatusErrors.ContainsKey(statusCode) ? StatusErrors[statusCode] : string.Empty;

        public static string From(HttpStatusCode statusCode) => From((int)statusCode);
    }
}
