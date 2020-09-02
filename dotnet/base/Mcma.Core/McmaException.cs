using System;
using System.Runtime.Serialization;
using Mcma.Serialization;

namespace Mcma
{
    [Serializable]
    public sealed class McmaException : Exception
    {
        public McmaException(string message, Exception cause = null, object context = null)
            : base(message, cause)
        {
            if (context != null)
                Data.Add("Context", context.ToMcmaJson().ToString());
        }

        private McmaException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }
    }
}