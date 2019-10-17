﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Core;
using Mcma.Core.Context;
using Mcma.Core.Logging;
using Mcma.Data;

namespace Mcma.Worker
{
    public class WorkerJobHelper<T> : IContext where T : Job
    {
        public WorkerJobHelper(
            IDbTable<JobAssignment, Type> table,
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

        public IDbTable<JobAssignment, Type> Table { get; }

        public string JobAssignmentId { get; }

        public JobAssignment JobAssignment { get; private set; }

        public T Job { get; private set; }

        public JobProfile Profile { get; private set; }

        public ILogger Logger => Request.Logger;

        public IContextVariables Variables => Request.Variables;

        public JobParameterBag JobInput => Job.JobInput;

        public JobParameterBag JobOutput => Job.JobOutput;

        public async Task InitializeAsync()
        {
            await UpdateJobAssignmentStatusAsync(JobStatus.Running);

            Job = await ResourceManager.ResolveResourceFromFullUrl<T>(JobAssignment.Job);

            Profile = await ResourceManager.ResolveResourceFromFullUrl<JobProfile>(Job.JobProfile);

            Job.JobOutput = new JobParameterBag();
        }

        public void ValidateJob(IEnumerable<string> supportedProfiles)
        {
            var supportedJobProfiles = supportedProfiles?.ToArray() ?? new string[0];
            if (!supportedJobProfiles.Contains(Profile.Name, StringComparer.OrdinalIgnoreCase))
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

        public Task CompleteAsync()
            => UpdateJobAssignmentAsync(
                ja =>
                {
                    ja.Status = JobStatus.Completed;
                    ja.JobOutput = JobOutput;
                },
                true);

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
