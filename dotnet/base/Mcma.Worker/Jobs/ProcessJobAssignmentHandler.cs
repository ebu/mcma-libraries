using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Core.Logging;
using Mcma.Data;

namespace Mcma.Worker
{
    public class ProcessJobAssignment<T> : WorkerOperationHandler<ProcessJobAssignmentRequest> where T : Job
    {
        internal ProcessJobAssignment(
            IDbTableProvider dbTableProvider,
            IResourceManagerProvider resourceManagerProvider)
        {
            if (dbTableProvider == null) throw new ArgumentNullException(nameof(dbTableProvider));
            if (resourceManagerProvider == null) throw new ArgumentNullException(nameof(resourceManagerProvider));

            DbTableProvider = dbTableProvider;
            ResourceManagerProvider = resourceManagerProvider;
        }

        private IDbTableProvider DbTableProvider { get; }

        private IResourceManagerProvider ResourceManagerProvider { get; }

        internal Dictionary<string, IJobProfileHandler<T>> ProfileHandlers { get; } =
            new Dictionary<string, IJobProfileHandler<T>>(StringComparer.OrdinalIgnoreCase);

        protected override async Task ExecuteAsync(WorkerRequest request, ProcessJobAssignmentRequest requestInput)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (requestInput == null) throw new ArgumentNullException(nameof(requestInput));

            var workerJobHelper =
                new WorkerJobHelper<T>(
                    DbTableProvider.Table<JobAssignment>(request.Variables.TableName()),
                    ResourceManagerProvider.Get(request.Variables),
                    request,
                    requestInput.JobAssignmentId);

            try
            {
                workerJobHelper.Logger.Debug("Initializing job helper...");

                await workerJobHelper.InitializeAsync();
                
                workerJobHelper.Logger.Debug("Validating job...");
                
                workerJobHelper.ValidateJob(ProfileHandlers.Keys);
                
                workerJobHelper.Logger.Debug("Getting handler for profile '" + workerJobHelper.Profile?.Name + "'...");

                var profileHandler = ProfileHandlers[workerJobHelper.Profile.Name];

                workerJobHelper.Logger.Debug("Using profile handler of type '" + profileHandler.GetType().Name + "' for profile '" + workerJobHelper.Profile?.Name + "'...");
                
                await profileHandler.ExecuteAsync(workerJobHelper);
            }
            catch (Exception ex)
            {
                workerJobHelper.Logger.Exception(ex);
                try
                {
                    await workerJobHelper.FailAsync(ex.ToString());
                }
                catch (Exception innerEx)
                {
                    workerJobHelper.Logger.Exception(innerEx);
                }
            }
        }
    }
}
