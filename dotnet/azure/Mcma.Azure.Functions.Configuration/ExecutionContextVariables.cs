using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Configuration;

namespace Mcma.Azure.Functions
{
    public class ExecutionContextVariables : ConfigurationContextVariables
    {
        public ExecutionContextVariables(ExecutionContext executionContext)
            : base(BuildConfiguration(executionContext))
        {
        }

        private static IConfiguration BuildConfiguration(ExecutionContext executionContext)
            => new ConfigurationBuilder()
                .SetBasePath(executionContext.FunctionAppDirectory)
                .AddEnvironmentVariables()
                .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
                .Build();
    }
}
