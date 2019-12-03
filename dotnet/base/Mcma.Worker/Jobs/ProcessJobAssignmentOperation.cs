using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Data;

namespace Mcma.Worker
{
    public class ProcessJobAssignmentOperation<TJob> : WorkerOperation<ProcessJobAssignmentRequest> where TJob : Job
    {
        internal ProcessJobAssignmentOperation(ProviderCollection providerCollection)
            : base(providerCollection)
        {
        }

        internal List<IJobProfile<TJob>> Profiles { get; } = new List<IJobProfile<TJob>>();

        public override string Name => "ProcessJobAssignment";

        public ProcessJobAssignmentOperation<TJob> AddProfile<TProfile>() where TProfile : IJobProfile<TJob>, new()
            => AddProfile(new TProfile());

        public ProcessJobAssignmentOperation<TJob> AddProfile(string profileName, Func<ProcessJobAssignmentHelper<TJob>, Task> profileHandler)
            => AddProfile(new DelegateJobProfile<TJob>(profileName, profileHandler));

        public ProcessJobAssignmentOperation<TJob> AddProfile(IJobProfile<TJob> profile)
        {
            var existing = Profiles.FirstOrDefault(p => p.Name.Equals(profile.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
                throw new Exception($"Cannot add duplicate job profile with name '{profile.Name}'.");

            Profiles.Add(profile);
            
            return this;
        }

        protected override async Task ExecuteAsync(WorkerRequest request, ProcessJobAssignmentRequest requestInput)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));
            if (requestInput == null) throw new ArgumentNullException(nameof(requestInput));

            var logger = ProviderCollection.LoggerProvider.Get(request.Tracker);

            var helper =
                new ProcessJobAssignmentHelper<TJob>(
                    ProviderCollection.DbTableProvider.Table<JobAssignment>(request.TableName()),
                    ProviderCollection.ResourceManagerProvider.Get(request),
                    logger,
                    request,
                    requestInput.JobAssignmentId);

            try
            {
                logger.Debug("Initializing job helper...");

                await helper.InitializeAsync();
                
                logger.Debug("Validating job...");
                
                helper.ValidateJob(Profiles.Select(p => p.Name));
                
                logger.Debug("Getting handler for profile '" + helper.Profile?.Name + "'...");

                var profileHandler = Profiles.FirstOrDefault(p => p.Name.Equals(helper.Profile.Name, StringComparison.OrdinalIgnoreCase));

                logger.Debug("Using profile handler of type '" + profileHandler.GetType().Name + "' for profile '" + helper.Profile?.Name + "'...");
                
                await profileHandler.ExecuteAsync(helper);
            }
            catch (Exception ex)
            {
                logger.Error($"An error occurred executing request for operation '{request.OperationName}'", ex);
                try
                {
                    await helper.FailAsync(ex.ToString());
                }
                catch (Exception innerEx)
                {
                    logger.Error($"An error occurred marking job assignment with ID '{helper.JobAssignmentId}'.", innerEx);
                }
            }
        }
    }
}
