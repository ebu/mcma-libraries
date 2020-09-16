import { v4 as uuidv4 } from "uuid";

import { JobAssignment, McmaTracker } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";

import { DefaultRouteCollection } from "./default-route-collection";
import { InvokeWorker, WorkerInvoker } from "../../worker-invoker";
import { getWorkerFunctionId, getPublicUrl } from "../../context-variable-provider-ext";
import { McmaApiRequestContext } from "../../http";

export class DefaultJobRouteCollection extends DefaultRouteCollection<JobAssignment> {
    private workerInvoker: WorkerInvoker;

    constructor(
        dbTableProvider: DocumentDatabaseTableProvider,
        invokeWorker: InvokeWorker,
        root?: string
    ) {
        super(dbTableProvider, JobAssignment, root);

        this.workerInvoker = new WorkerInvoker(invokeWorker);

        this.create.onStarted = reqCtx => this.onJobStarted(reqCtx);
        this.create.onCompleted = (reqCtx, jobAssignment) => this.onJobCompleted(reqCtx, jobAssignment);
    }

    async onJobStarted(requestContext: McmaApiRequestContext): Promise<boolean> {
        let body = requestContext.getRequestBody();
        if (!body.tracker) {
            body.tracker = new McmaTracker({ id: uuidv4(), label: body["@type"] });
        }
        return true;
    }

    async onJobCompleted(requestContext: McmaApiRequestContext, jobAssignment: JobAssignment)  {
        await this.workerInvoker.invoke(
            getWorkerFunctionId(requestContext),
            "ProcessJobAssignment",
            requestContext.getAllContextVariables(),
            {
                jobAssignmentDatabaseId: jobAssignment.id.replace(getPublicUrl(requestContext), "")
            },
            jobAssignment.tracker
        );
    }
}
