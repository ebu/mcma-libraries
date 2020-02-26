import * as uuid from "uuid/v4";

import { McmaTracker, JobAssignment } from "@mcma/core";
import { DefaultRouteCollectionBuilder } from "./default-route-collection-builder";
import { WorkerInvoker, InvokeWorker } from "../../worker-invoker";
import { getWorkerFunctionId } from "../../context-variable-provider-ext";

export function forJobAssignments(builder: DefaultRouteCollectionBuilder<JobAssignment>, invokeWorker: InvokeWorker) {
    const workerInvoker = new WorkerInvoker(invokeWorker);

    return builder.addAll()
        .route(r => r.create).configure(rb =>
            rb.onStarted(async (requestContext) => {
                let body = requestContext.getRequestBody();
                if (!body.tracker) {
                    body.tracker = new McmaTracker({ id: uuid(), label: body["@type"] });
                }
                return true;
            }).onCompleted(async (requestContext, jobAssignment) => {
                await workerInvoker.invoke(
                    getWorkerFunctionId(requestContext),
                    "ProcessJobAssignment",
                    requestContext.getAllContextVariables(),
                    {
                        jobAssignmentId: jobAssignment.id
                    },
                    jobAssignment.tracker,
                );
                return jobAssignment;
            })
        )
        .build();
};
