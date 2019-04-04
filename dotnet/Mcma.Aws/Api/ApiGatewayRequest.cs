
using System.Collections.Generic;
using Mcma.Api;

namespace Mcma.Aws.Api
{
    public class ApiGatewayRequest : McmaApiRequest, IStageVariableProvider
    {

        public IDictionary<string, string> StageVariables { get; set; }
    }
}