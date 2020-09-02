using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Logging;
using Mcma.Data;

namespace Mcma.Worker
{
    public class ProcessJobAssignmentHelper<T> where T : Job
    {
        public ProcessJobAssignmentHelper(
            IDocumentDatabaseTable dbTable,
            IResourceManager resourceManager,
            WorkerRequestContext requestContext)
        {
            DbTable = dbTable;
            ResourceManager = resourceManager;
            RequestContext = requestContext;
            JobAssignmentId = requestContext.GetInputAs<ProcessJobAssignmentRequest>().JobAssignmentId;
        }

        public IDocumentDatabaseTable DbTable { get; }
        public IResourceManager ResourceManager { get; }
        public WorkerRequestContext RequestContext { get; }
        public string JobAssignmentId { get; }

        public ILogger Logger => RequestContext.Logger;
        public JobAssignment JobAssignment { get; private set; }
        public T Job { get; private set; }
        public JobProfile Profile { get; private set; }
        public JobParameterBag JobInput => Job.JobInput;
        public JobParameterBag JobOutput => Job.JobOutput;

        public async Task InitializeAsync()
        {
            JobAssignment = await UpdateJobAssignmentStatusAsync(JobStatus.Running);

            Job = await ResourceManager.ResolveResourceFromFullUrl<T>(JobAssignment.Job);
            Profile = await ResourceManager.ResolveResourceFromFullUrl<JobProfile>(Job.JobProfile);

            Job.JobOutput = new JobParameterBag();
        }

        public void ValidateJob(IEnumerable<string> supportedProfiles)
        {
            if (Profile.InputParameters == null) return;
            
            var missingInputParams =
                Profile.InputParameters.Where(p => !Job.JobInput.HasProperty(p.ParameterName)).Select(p => p.ParameterName).ToList();
            if (missingInputParams.Any())
                throw new Exception("One or more required input parameters are missing from the job: " + string.Join(", ", missingInputParams));
        }

        public Task<JobAssignment> CompleteAsync()
            => UpdateJobAssignmentAsync(
                ja =>
                {
                    ja.Status = JobStatus.Completed;
                    ja.JobOutput = Job?.JobOutput;
                },
                true);

        public Task<JobAssignment> FailAsync(ProblemDetail error)
            => UpdateJobAssignmentAsync(
                   ja =>
                   {
                       ja.Status = JobStatus.Failed;
                       ja.Error = error;
                       ja.JobOutput = Job?.JobOutput;
                   },
                   true);

        public Task<JobAssignment> CancelAsync()
            => UpdateJobAssignmentAsync(
                ja =>
                {
                    ja.Status = JobStatus.Canceled;
                    ja.JobOutput = Job?.JobOutput;
                },
                true);

        public Task<JobAssignment> UpdateJobAssignmentOutputAsync()
            => UpdateJobAssignmentAsync(ja => ja.JobOutput = JobOutput);

        public Task<JobAssignment> UpdateJobAssignmentStatusAsync(string status)
            => UpdateJobAssignmentAsync(
                ja => ja.Status = status,
                true);

        public async Task<JobAssignment> UpdateJobAssignmentAsync(Action<JobAssignment> update, bool sendNotification = false)
        {
            var jobAssignment = await GetJobAssignmentAsync();
            if (jobAssignment == null)
                throw new McmaException("JobAssignment with id '" + JobAssignmentId + "' not found");

            update(jobAssignment);

            jobAssignment.DateModified = DateTime.UtcNow;
            await DbTable.PutAsync(JobAssignmentId, jobAssignment);

            JobAssignment = jobAssignment;
            
            if (sendNotification)
                await SendNotificationAsync();

            return jobAssignment;
        }

        private async Task<JobAssignment> GetJobAssignmentAsync()
        {
            var jobAssignment = await DbTable.GetAsync<JobAssignment>(JobAssignmentId);

            foreach (var delay in new[] {5, 10, 15})
            {
                if (jobAssignment != null)
                    break;

                Logger?.Warn($"Failed to obtain job assignment from database table. Trying again in ${delay} seconds.");
                await Task.Delay(delay * 1000);
                jobAssignment = await DbTable.GetAsync<JobAssignment>(JobAssignmentId);
            }
            
            return jobAssignment;
        }

        public async Task SendNotificationAsync()
        {
            if (ResourceManager != null)
                await ResourceManager.SendNotificationAsync(JobAssignment, JobAssignment.NotificationEndpoint);
        }
    }
}
