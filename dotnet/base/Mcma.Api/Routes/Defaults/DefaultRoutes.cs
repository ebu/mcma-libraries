using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma.Core;
using Mcma.Core.Utility;
using Mcma.Data;

namespace Mcma.Api.Routes.Defaults
{
    public class DefaultRoutes<TResource> where TResource : McmaResource
    {           
        internal DefaultRoutes()
        {
        }

        internal List<IDefaultRouteBuilder> Included { get; } = new List<IDefaultRouteBuilder>();

        internal void AddAll() => Included.AddRange(new IDefaultRouteBuilder[] { Query, Create, Get, Update, Delete });

        public DefaultRouteBuilder<IEnumerable<TResource>> Query { get; internal set; }

        public DefaultRouteBuilder<TResource> Create { get; internal set; }

        public DefaultRouteBuilder<TResource> Get { get; internal set; }

        public DefaultRouteBuilder<TResource> Update { get; internal set; }

        public DefaultRouteBuilder<TResource> Delete { get; internal set; }
    }

    public static class DefaultRoutes
    {
        public static readonly string[] SupportedMethods = {HttpMethod.Get.Method, HttpMethod.Post.Method, HttpMethod.Put.Method, HttpMethod.Delete.Method};

        public static DefaultRouteCollectionBuilder<T> Builder<T>(IDbTableProvider dbTableProvider, string root = null) where T : McmaResource
            => new DefaultRouteCollectionBuilder<T>(dbTableProvider, root ?? typeof(T).Name.CamelCaseToKebabCase().PluralizeKebabCase());

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments<T>(IDbTableProvider dbTableProvider, string root = null) where T : IWorkerInvoker, new()
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobAssignments<T>();

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments(
            IDbTableProvider dbTableProvider,
            IWorkerInvoker workerInvoker,
            string root = null,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobAssignments(workerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments(
            IDbTableProvider dbTableProvider,
            Func<McmaApiRequestContext, JobAssignment, IWorkerInvoker> createWorkerInvoker,
            string root = null,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => DefaultRoutes.Builder<JobAssignment>(dbTableProvider, root).ForJobAssignments(createWorkerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments<T>(this DefaultRouteCollectionBuilder<JobAssignment> builder)
            where T : IWorkerInvoker, new()
            => builder.ForJobAssignments(new T());

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments(
            this DefaultRouteCollectionBuilder<JobAssignment> builder,
            IWorkerInvoker workerInvoker,
            Func<McmaApiRequestContext, IDictionary<string, string>> contextVariables = null)
            => builder.ForJobAssignments((_1, _2) => workerInvoker, contextVariables);

        public static DefaultRouteCollectionBuilder<JobAssignment> ForJobAssignments(
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
