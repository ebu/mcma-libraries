using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Utility;
using Mcma.Data;

namespace Mcma.Api.Routing.Defaults
{

    public static class DefaultRoutes
    {
        public static readonly string[] SupportedMethods = {HttpMethod.Get.Method, HttpMethod.Post.Method, HttpMethod.Put.Method, HttpMethod.Delete.Method};

        public static DefaultRouteCollectionBuilder<T> Builder<T>(IDbTableProvider dbTableProvider, string root = null)
            where T : McmaResource
            => new DefaultRouteCollectionBuilder<T>(dbTableProvider, root ?? typeof(T).Name.CamelCaseToKebabCase().PluralizeKebabCase());

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs<T>(IDbTableProvider dbTableProvider, string root = null)
            where T : IWorkerInvoker, new()
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobs<T>();

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs(
            IDbTableProvider dbTableProvider,
            IWorkerInvoker workerInvoker,
            string root = null,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobs(workerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs(
            IDbTableProvider dbTableProvider,
            Func<McmaApiRequestContext, JobAssignment, IWorkerInvoker> createWorkerInvoker,
            string root = null,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobs(createWorkerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs<T>(this DefaultRouteCollectionBuilder<JobAssignment> builder)
            where T : IWorkerInvoker, new()
            => builder.ForJobs(new T());

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs(
            this DefaultRouteCollectionBuilder<JobAssignment> builder,
            IWorkerInvoker workerInvoker,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => builder.ForJobs((_1, _2) => workerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobs(
            this DefaultRouteCollectionBuilder<JobAssignment> builder,
            Func<McmaApiRequestContext, JobAssignment, IWorkerInvoker> createWorkerInvoker,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            =>
            builder
                .AddAll()
                .Route(r => r.Create).Configure(
                    configure =>
                        configure
                            .OnStarted(requestContext =>
                            {
                                var jobAssignment = requestContext.GetRequestBody<JobAssignment>();
                                if (jobAssignment.Tracker == null)
                                    jobAssignment.Tracker = new McmaTracker { Id = Guid.NewGuid().ToString(), Label = jobAssignment.Type };

                                return Task.CompletedTask;
                            })
                            .OnCompleted((requestContext, jobAssignment) =>
                                createWorkerInvoker(requestContext, jobAssignment)
                                    .InvokeAsync(
                                        requestContext.WorkerFunctionId(),
                                        "ProcessJobAssignment",
                                        contextVariables?.Invoke(requestContext),
                                        new { jobAssignmentId = jobAssignment.Id },
                                        jobAssignment.Tracker
                                    )
                            )
                );
    }
}
