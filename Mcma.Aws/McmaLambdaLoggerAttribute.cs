using System;
using Mcma.Core.Logging;

namespace Mcma.Aws
{
    [AttributeUsage(AttributeTargets.Assembly)]
    public class McmaLambdaLoggerAttribute : Attribute
    {
        public McmaLambdaLoggerAttribute() => Logger.Global = new LambdaLoggerWrapper();
    }

}