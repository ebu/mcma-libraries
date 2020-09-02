using System.Collections.Generic;
using System.Net;

namespace Mcma.Api
{
    public static class HttpStatusCodeMessage
    {
        private static readonly Dictionary<int, string> StatusErrors = new Dictionary<int, string>
        {
            [(int)HttpStatusCode.Continue]                      = "Continue",
            [(int)HttpStatusCode.SwitchingProtocols]            = "Switching Protocols",
            [102]                                               = "Processing",
            [103]                                               = "Checkpoint",
            
            [(int)HttpStatusCode.OK]                            = "OK",
            [(int)HttpStatusCode.Created]                       = "Created",
            [(int)HttpStatusCode.Accepted]                      = "Accepted",
            [(int)HttpStatusCode.NonAuthoritativeInformation]   = "Non-Authoritative Information",
            [(int)HttpStatusCode.NoContent]                     = "No Content",
            [(int)HttpStatusCode.ResetContent]                  = "Reset Content",
            [(int)HttpStatusCode.PartialContent]                = "Partial Content",
            [207]                                               = "Multi-Status",
            [208]                                               = "Already Reported",
            [227]                                               = "IM Used",
            
            [(int)HttpStatusCode.MultipleChoices]               = "Multiple Choices",
            [(int)HttpStatusCode.MovedPermanently]              = "Moved Permanently",
            [(int)HttpStatusCode.Found]                         = "Found",
            [(int)HttpStatusCode.SeeOther]                      = "See Other",
            [(int)HttpStatusCode.NotModified]                   = "Not Modified",
            [(int)HttpStatusCode.TemporaryRedirect]             = "Temporary Redirect",
            [308]                                               = "Permanent Redirect",
            
            [(int)HttpStatusCode.BadRequest]                    = "Bad Request",
            [(int)HttpStatusCode.Unauthorized]                  = "Unauthorized",
            [(int)HttpStatusCode.PaymentRequired]               = "Payment Required",
            [(int)HttpStatusCode.Forbidden]                     = "Forbidden",
            [(int)HttpStatusCode.NotFound]                      = "Not Found",
            [(int)HttpStatusCode.MethodNotAllowed]              = "Method Not Allowed",
            [(int)HttpStatusCode.NotAcceptable]                 = "Not Acceptable",
            [(int)HttpStatusCode.ProxyAuthenticationRequired]   = "Proxy Authentication Required ",
            [(int)HttpStatusCode.RequestTimeout]                = "Request Timeout",
            [(int)HttpStatusCode.Conflict]                      = "Conflict",
            [(int)HttpStatusCode.Gone]                          = "Gone",
            [(int)HttpStatusCode.LengthRequired]                = "Length Required",
            [(int)HttpStatusCode.PreconditionFailed]            = "Precondition Failed",
            [(int)HttpStatusCode.RequestEntityTooLarge]         = "Payload Too Large",
            [(int)HttpStatusCode.RequestUriTooLong]             = "URI Too Long",
            [(int)HttpStatusCode.UnsupportedMediaType]          = "Unsupported Media Type",
            [(int)HttpStatusCode.RequestedRangeNotSatisfiable]  = "Requested Range Not Satisfiable",
            [(int)HttpStatusCode.ExpectationFailed]             = "Expectation Failed",
            [418]                                               = "I'm a teapot",
            [422]                                               = "Unprocessable Entity",
            [423]                                               = "Locked",
            [424]                                               = "Failed Dependency",
            [425]                                               = "Too Early",
            [426]                                               = "Update Required",
            [428]                                               = "Precondition Required",
            [429]                                               = "Too Many Requests",
            [431]                                               = "Request Header Fields Too Large",
            [451]                                               = "Unavailable for Legal Reasons",
            
            [(int)HttpStatusCode.InternalServerError]           = "Internal Server Error",
            [(int)HttpStatusCode.NotImplemented]                = "Not Implemented",
            [(int)HttpStatusCode.BadGateway]                    = "Bad Gateway",
            [(int)HttpStatusCode.ServiceUnavailable]            = "Service Unavailable",
            [(int)HttpStatusCode.GatewayTimeout]                = "Gateway Timeout",
            [(int)HttpStatusCode.HttpVersionNotSupported]       = "HTTP Version Not Supported",
            [506]                                               = "Variant Also Negotiates",
            [507]                                               = "Insufficient Storage",
            [508]                                               = "Loop Detected",
            [509]                                               = "Bandwidth Limit Exceeded",
            [510]                                               = "Not Extended",
            [511]                                               = "Network Authentication Required"
        };

        public static string From(int statusCode) => StatusErrors.ContainsKey(statusCode) ? StatusErrors[statusCode] : string.Empty;

        public static string From(HttpStatusCode statusCode) => From((int)statusCode);
    }
}
