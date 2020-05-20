import { v4 as uuidv4 } from "uuid";

import { McmaTracker, JobAssignment } from "@mcma/core";
import { DbTableProvider } from "@mcma/data";

import { DefaultRouteCollectionBuilder } from "./default-route-collection-builder";
import { WorkerInvoker, InvokeWorker } from "../../worker-invoker";
import { getWorkerFunctionId } from "../../context-variable-provider-ext";

export function defaultRoutesForJobs(
    dbTableProvider: DbTableProvider,
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
                    {
                        operationName: "ProcessJobAssignment",
                        contextVariables: requestContext.getAllContextVariables(),
                        input: {
                            jobAssignmentId: jobAssignment.id
                        },
                        tracker: jobAssignment.tracker
                    }
                );
                return jobAssignment;
            })
        );
};
