using Mcma.Api;
using Mcma.Core.Logging;
using System.Net;
using Mcma.Core;
using Mcma.Core.Utility;
using Mcma.Data;

namespace Mcma.Api.Routes.Defaults
{
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
                                contextVariables = requestContext.ContextVariables,
                                input = new
                                {
                                    jobAssignmentId = jobAssignment.Id
                                }
                            })))
                .Build();
    }
}
