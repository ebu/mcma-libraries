import { v4 as uuidv4 } from "uuid";

import { JobAssignment, McmaTracker } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { DefaultRouteCollectionBuilder } from "./default-route-collection-builder";
import { InvokeWorker, WorkerInvoker } from "../../worker-invoker";
import { getWorkerFunctionId, getPublicUrl } from "../../context-variable-provider-ext";

export function defaultRoutesForJobs(
    dbTableProvider: DocumentDatabaseTableProvider,
    invokeWorker: InvokeWorker,
    root?: string
): DefaultRouteCollectionBuilder<JobAssignment> {
    const builder = new DefaultRouteCollectionBuilder<JobAssignment>(dbTableProvider, JobAssignment, root);
    const workerInvoker = new WorkerInvoker(invokeWorker);

    return builder.addAll()
        .route(r => r.create).configure(rb =>
            rb.onStarted(async (requestContext) => {
                let body = requestContext.getRequestBody();
                if (!body.tracker) {
                    body.tracker = new McmaTracker({ id: uuidv4(), label: body["@type"] });
                }
                return true;
            }).onCompleted(async (requestContext, jobAssignment) => {
                await workerInvoker.invoke(
                    getWorkerFunctionId(requestContext),
                    "ProcessJobAssignment",
                    requestContext.getAllContextVariables(),
                    {
                        jobAssignmentId: jobAssignment.id.replace(getPublicUrl(requestContext), "")
                    },
                    jobAssignment.tracker
                );
                return jobAssignment;
            })
        );
}
