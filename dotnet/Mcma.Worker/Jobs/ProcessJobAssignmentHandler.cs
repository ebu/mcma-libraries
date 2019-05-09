using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Logging;
using Mcma.Data;

namespace Mcma.Worker
{
    public class ProcessJobAssignmentHandler<T> : WorkerOperationHandler<ProcessJobAssignment> where T : Job
    {
        internal ProcessJobAssignmentHandler(
            IDbTableProvider<JobAssignment> dbTableProvider,
            IWorkerResourceManagerProvider resourceManagerProvider)
        {
            if (dbTableProvider == null) throw new ArgumentNullException(nameof(dbTableProvider));
            if (resourceManagerProvider == null) throw new ArgumentNullException(nameof(resourceManagerProvider));

            DbTableProvider = dbTableProvider;
            ResourceManagerProvider = resourceManagerProvider;
        }

        private IDbTableProvider<JobAssignment> DbTableProvider { get; }

        private IWorkerResourceManagerProvider ResourceManagerProvider { get; }

        internal Dictionary<string, IJobProfileHandler<T>> ProfileHandlers { get; } =
            new Dictionary<string, IJobProfileHandler<T>>(StringComparer.OrdinalIgnoreCase);

        protected override async Task ExecuteAsync(WorkerRequest request, ProcessJobAssignment requestInput)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (requestInput == null) throw new ArgumentNullException(nameof(requestInput));

            var workerJobHelper =
                new WorkerJobHelper<T>(
                    DbTableProvider.Table(request.TableName()),
                    ResourceManagerProvider.GetResourceManager(request),
                    request,
                    requestInput.JobAssignmentId);

            try
            {
                Logger.Debug("Initializing job helper...");

                await workerJobHelper.InitializeAsync();
                
                Logger.Debug("Validating job...");
                
                workerJobHelper.ValidateJob(ProfileHandlers.Keys);
                
                Logger.Debug("Getting handler for profile '" + workerJobHelper.Profile?.Name + "'...");

                var profileHandler = ProfileHandlers[workerJobHelper.Profile.Name];

                Logger.Debug("Using profile handler of type '" + profileHandler.GetType().Name + "' for profile '" + workerJobHelper.Profile?.Name + "'...");
                
                await profileHandler.RunAsync(workerJobHelper);
            }
            catch (Exception ex)
            {
                Logger.Exception(ex);
                try
                {
                    await workerJobHelper.FailAsync(ex.ToString());
                }
                catch (Exception innerEx)
                {
                    Logger.Exception(innerEx);
                }
            }
        }
    }
}
