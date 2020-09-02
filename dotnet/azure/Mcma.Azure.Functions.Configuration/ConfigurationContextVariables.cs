using System.Linq;
using Mcma.Context;
using Microsoft.Extensions.Configuration;

namespace Mcma.Azure.Functions
{
    public class ConfigurationContextVariables : ContextVariableProvider
    {
        public ConfigurationContextVariables(IConfiguration configuration)
            : base(configuration.AsEnumerable().ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
        {
            Configuration = configuration;
        }

        protected IConfiguration Configuration { get; }
    }
}
