using System;
using Mcma.Core.Logging;

namespace Mcma.Aws.Lambda
{
    [AttributeUsage(AttributeTargets.Assembly)]
    public class McmaLambdaLoggerAttribute : Attribute
    {
        public McmaLambdaLoggerAttribute() => Logger.Global = new LambdaLoggerWrapper();
    }

}