const uuidv4 = require("uuid/v4");

const { McmaTracker } = require ("@mcma/core");
const { DefaultRouteCollectionBuilder } = require("./default-routes");
const { WorkerInvoker } = require("../worker-invoker");

DefaultRouteCollectionBuilder.prototype.forJobAssignments = function forJobAssignments(invokeWorker) {
    const workerInvoker = new WorkerInvoker(invokeWorker);

    return this.addAll()
        .route(r => r.create).configure(rb =>
            rb.onStarted(async (requestContext) => {
                let body = requestContext.getRequestBody();
                if (!body.tracker) {
                    body.tracker = new McmaTracker({ id: uuidv4(), label: body["@type"] });
                }
                return true;
            }).onCompleted(async (requestContext, jobAssignment) =>
                await workerInvoker.invoke(
                    requestContext.workerFunctionId(),
                    "ProcessJobAssignment",
                    requestContext.getAllContextVariables(),
                    {
                        jobAssignmentId: jobAssignment.id
                    },
                    jobAssignment.tracker,
                )
            )
        )
        .build();
};
