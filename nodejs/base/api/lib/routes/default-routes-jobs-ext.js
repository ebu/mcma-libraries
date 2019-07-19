const { DefaultRouteCollectionBuilder } = require("./default-routes");
const { WorkerInvoker } = require("../worker-invoker");

DefaultRouteCollectionBuilder.prototype.forJobAssignments = function forJobAssignments(invokeWorker) {
    const workerInvoker = new WorkerInvoker(invokeWorker);

    return this.addAll()
        .route(r => r.create).configure(rb =>
            rb.onCompleted(async (requestContext, jobAssignment) =>
                await workerInvoker.invoke(
                    requestContext.workerFunctionId(),
                    "ProcessJobAssignment",
                    requestContext.getAllContextVariables(),
                    {
                        jobAssignmentId: jobAssignment.id
                    }
                )
            )
        )
        .build();
};