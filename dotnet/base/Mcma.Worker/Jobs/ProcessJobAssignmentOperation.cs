using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma;
using Mcma.Context;
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

        public ProcessJobAssignmentOperation<TJob> AddProfile(string profileName, Func<ProviderCollection, ProcessJobAssignmentHelper<TJob>, WorkerRequestContext, Task> profileHandler)
            => AddProfile(new DelegateJobProfile<TJob>(profileName, profileHandler));

        public ProcessJobAssignmentOperation<TJob> AddProfile(IJobProfile<TJob> profile)
        {
            var existing = Profiles.FirstOrDefault(p => p.Name.Equals(profile.Name, StringComparison.OrdinalIgnoreCase));
            if (existing != null)
                throw new Exception($"Cannot add duplicate job profile with name '{profile.Name}'.");

            Profiles.Add(profile);
            
            return this;
        }

        protected override async Task ExecuteAsync(WorkerRequestContext requestContext, ProcessJobAssignmentRequest requestInput)
        {
            if (requestContext == null) throw new ArgumentNullException(nameof(requestContext));
            if (requestInput == null) throw new ArgumentNullException(nameof(requestInput));

            var jobAssignmentHelper =
                new ProcessJobAssignmentHelper<TJob>(
                    await ProviderCollection.DbTableProvider.GetAsync(requestContext.TableName()),
                    ProviderCollection.ResourceManagerProvider.Get(requestContext),
                    requestContext);

            try
            {
                requestContext.Logger?.Debug("Initializing job helper...");

                await jobAssignmentHelper.InitializeAsync();
                
                requestContext.Logger?.Info("Validating job...");

                var matchedProfile = Profiles.FirstOrDefault(p => p.Name.Equals(jobAssignmentHelper.Profile.Name, StringComparison.OrdinalIgnoreCase));
                if (matchedProfile == null)
                {
                    await FailJobAsync(requestContext, jobAssignmentHelper, $"Job profile {jobAssignmentHelper.Profile?.Name} is not supported.");
                    return;
                }
                
                jobAssignmentHelper.ValidateJob(Profiles.Select(p => p.Name));

                requestContext.Logger?.Info($"Found handler for job profile '{matchedProfile.Name}'"); 
                
                await matchedProfile.ExecuteAsync(ProviderCollection, jobAssignmentHelper, requestContext);

                requestContext.Logger?.Info($"Handler for job profile '{matchedProfile.Name}' completed");
            }
            catch (Exception ex)
            {
                requestContext.Logger?.Error($"An error occurred executing request for operation '{requestContext.OperationName}'", ex);
                await FailJobAsync(requestContext, jobAssignmentHelper, ex.Message);
            }
        }

        private async Task FailJobAsync(WorkerRequestContext requestContext, ProcessJobAssignmentHelper<TJob> jobAssignmentHelper, string message)
        {
            try {
                await jobAssignmentHelper.FailAsync(new ProblemDetail
                {
                    Type = "uri://mcma.ebu.ch/rfc7807/generic-job-failure",
                    Title = "Generic job failure",
                    Detail = message
                });
            }
            catch (Exception innerEx)
            {
                requestContext.Logger?.Error("An error occurred marking the job assignment failed.", innerEx);
            }
        }
    }
}
