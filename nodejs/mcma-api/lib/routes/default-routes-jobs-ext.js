const { DefaultRouteCollectionBuilder } = require("./default-routes");

DefaultRouteCollectionBuilder.prototype.forJobAssignments = function forJobAssignments(invokeWorker) {
    if (typeof invokeWorker !== "function") {
        throw new Error("invokeWorker must be a function.");
    }

    return this.addAll()
        .route(r => r.create).configure(rb =>
            rb.onCompleted(async (requestContext, jobAssignment) =>
                await invokeWorker(requestContext.workerFunctionName(), {
                    operationName: "ProcessJobAssignment",
                    contextVariables: requestContext.contextVariables,
                    input: {
                        jobAssignmentId: jobAssignment.id
                    }
                })
            )
        )
        .build();
};