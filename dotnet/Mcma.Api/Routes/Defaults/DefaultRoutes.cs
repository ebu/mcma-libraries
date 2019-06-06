using Mcma.Api;
using Mcma.Core.Logging;
using System.Net;
using Mcma.Core;
using Mcma.Core.Utility;
using Mcma.Data;
using System.Collections.Generic;

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
        public static DefaultRouteCollectionBuilder<T> Builder<T>(IDbTableProvider<T> dbTableProvider, string root = null) where T : McmaResource
            => new DefaultRouteCollectionBuilder<T>(dbTableProvider, root ?? typeof(T).Name.CamelCaseToKebabCase().PluralizeKebabCase());

        public static McmaApiRouteCollection ForJobAssignments<T>(this DefaultRouteCollectionBuilder<JobAssignment> builder)
            where T : IWorkerInvoker, new()
            => builder.ForJobAssignments(new T());

        public static McmaApiRouteCollection ForJobAssignments(this DefaultRouteCollectionBuilder<JobAssignment> builder, IWorkerInvoker workerInvoker)
            =>
            builder
                .AddAll()
                .Route(r => r.Create).Configure(rb =>
                    rb.OnCompleted((requestContext, jobAssignment) =>
                        workerInvoker.RunAsync(requestContext.WorkerFunctionName(),
                            new
                            {
                                operationName = "ProcessJobAssignment",
                                contextVariables = requestContext.GetAllContextVariables(),
                                input = new
                                {
                                    jobAssignmentId = jobAssignment.Id
                                }
                            })))
                .Build();
    }
}
