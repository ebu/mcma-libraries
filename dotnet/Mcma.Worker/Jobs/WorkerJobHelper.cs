using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Data;

namespace Mcma.Worker
{
    public class WorkerJobHelper<T> where T : Job
    {
        public WorkerJobHelper(
            IDbTable<JobAssignment> table,
            ResourceManager resourceManager,
            WorkerRequest request,
            string jobAssignmentId)
        {
            Table = table;
            ResourceManager = resourceManager;
            Request = request;
            
            JobAssignmentId = jobAssignmentId;
        }

        public WorkerRequest Request { get; }

        public ResourceManager ResourceManager { get; }

        public IDbTable<JobAssignment> Table { get; }

        public string JobAssignmentId { get; }

        public JobAssignment JobAssignment { get; private set; }

        public T Job { get; private set; }

        public JobProfile Profile { get; private set; }

        public JobParameterBag JobInput => Job.JobInput;

        public JobParameterBag JobOutput => Job.JobOutput;

        public async Task InitializeAsync()
        {
            JobAssignment = await Table.UpdateJobStatus<JobAssignment>(JobAssignmentId, JobStatus.Running);

            Job = await ResourceManager.ResolveResourceFromFullUrl<T>(JobAssignment.Job);

            Profile = await ResourceManager.ResolveResourceFromFullUrl<JobProfile>(Job.JobProfile);

            Job.JobOutput = new JobParameterBag();
        }

        public void ValidateJob(IEnumerable<string> supportedProfiles)
        {
            var SupportedJobProfiles = supportedProfiles?.ToArray() ?? new string[0];
            if (!SupportedJobProfiles.Contains(Profile.Name, StringComparer.OrdinalIgnoreCase))
                throw new Exception($"Job profile '{Profile.Name}' is not supported");

            if (Profile.InputParameters != null)
            {
                var missingInputParams =
                    Profile.InputParameters.Where(p => !Job.JobInput.HasProperty(p.ParameterName)).Select(p => p.ParameterName).ToList();
                if (missingInputParams.Any())
                    throw new Exception("One or more required input parameters are missing from the job: " + string.Join(", ", missingInputParams));
            }
        }

        public async Task FailAsync(string error)
        {
            await UpdateJobAssignmentStatusAsync(JobStatus.Failed, error);
        }

        public async Task CompleteAsync()
        {
            await UpdateJobAssignmentOutputAsync();
            await UpdateJobAssignmentStatusAsync(JobStatus.Completed);
        }

        public async Task UpdateJobAssignmentAsync(Action<JobAssignment> update, bool sendNotification = false)
        {
            JobAssignment = await Table.GetAsync(JobAssignmentId);
            if (JobAssignment == null)
                throw new Exception("JobAssignment with id '" + JobAssignmentId + "' not found");

            update(JobAssignment);

            JobAssignment.DateModified = DateTime.UtcNow;
            await Table.PutAsync(JobAssignmentId, JobAssignment);
            
            if (sendNotification)
                await SendNotificationAsync();
        }

        public Task UpdateJobAssignmentOutputAsync()
            => UpdateJobAssignmentAsync(ja => ja.JobOutput = JobOutput);

        public Task UpdateJobAssignmentStatusAsync(string status, string statusMessage = null)
            => UpdateJobAssignmentAsync(
                ja =>
                {
                    ja.Status = status;
                    ja.StatusMessage = statusMessage;
                },
                true);

        public async Task SendNotificationAsync()
        {
            if (ResourceManager != null)
                await ResourceManager.SendNotificationAsync(JobAssignment, JobAssignment.NotificationEndpoint);
        }
    }
}
