using System.Linq;
using Mcma.Core.ContextVariables;
using Microsoft.Extensions.Configuration;

namespace Mcma.Azure.Functions
{
    public class ConfigurationContextVariableProvider : ContextVariableProvider
    {
        public ConfigurationContextVariableProvider(IConfiguration configuration)
            : base(configuration.AsEnumerable().ToDictionary(kvp => kvp.Key, kvp => kvp.Value))
        {
            Configuration = configuration;
        }

        protected IConfiguration Configuration { get; }
    }
}
