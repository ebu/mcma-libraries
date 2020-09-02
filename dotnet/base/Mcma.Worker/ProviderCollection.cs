using System;
using Mcma.Client;
using Mcma.Context;
using Mcma.Logging;
using Mcma.Data;

namespace Mcma.Worker
{
    public class ProviderCollection
    {
        private readonly ILoggerProvider _loggerProvider;
        private readonly IResourceManagerProvider _resourceManagerProvider;
        private readonly IDocumentDatabaseTableProvider _dbTableProvider;
        private readonly IAuthProvider _authProvider;
        private readonly IContextVariableProvider _environmentVariableProvider;

        public ProviderCollection(ILoggerProvider loggerProvider,
                                  IResourceManagerProvider resourceManagerProvider,
                                  IDocumentDatabaseTableProvider dbTableProvider,
                                  IAuthProvider authProvider,
                                  IContextVariableProvider environmentVariableProvider = null)
        {
            _loggerProvider = loggerProvider;
            _resourceManagerProvider = resourceManagerProvider;
            _dbTableProvider = dbTableProvider;
            _authProvider = authProvider;
            _environmentVariableProvider = environmentVariableProvider ?? new EnvironmentVariableProvider();
        }

        public ILoggerProvider LoggerProvider
            => _loggerProvider ?? throw new Exception($"{nameof(LoggerProvider)} not available.");

        public IResourceManagerProvider ResourceManagerProvider
            => _resourceManagerProvider ?? throw new Exception($"{nameof(ResourceManagerProvider)} not available.");

        public IDocumentDatabaseTableProvider DbTableProvider
            => _dbTableProvider ?? throw new Exception($"{nameof(DbTableProvider)} not available.");

        public IContextVariableProvider EnvironmentVariableProvider
            => _environmentVariableProvider ?? throw new Exception($"{nameof(EnvironmentVariableProvider)} not available.");

        public IAuthProvider AuthProvider
            => _authProvider ?? throw new Exception($"{nameof(AuthProvider)} not available.");
    }
}