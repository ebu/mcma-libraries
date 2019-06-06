using System;

namespace Mcma.Api
{
    public class McmaApiError
    {
        public McmaApiError(int status = 0, string message = null, string path = null)
        {
            Status = status;
            Error = HttpStatusCodeMessage.From(status);
            Message = message;
            Path = path;
        }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public int Status { get; set; }

        public string Error { get; set; }

        public string Message { get; set; }

        public string Path { get; set; }
    }
}
