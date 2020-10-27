import { v4 as uuidv4 } from "uuid";

import { JobAssignment, McmaTracker } from "@mcma/core";
import { DocumentDatabaseTableProvider } from "@mcma/data";
import { getWorkerFunctionId, InvokeWorker, WorkerInvoker } from "@mcma/worker-invoker";

import { DefaultRouteCollection } from "./default-route-collection";
import { getPublicUrl } from "../../config-variables-ext";
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

        this.create.onStarted = reqCtx => this.onJobAssignmentCreationStarted(reqCtx);
        this.create.onCompleted = (reqCtx, jobAssignment) => this.onJobAssignmentCreationCompleted(reqCtx, jobAssignment);
    }

    async onJobAssignmentCreationStarted(requestContext: McmaApiRequestContext): Promise<boolean> {
        let body = requestContext.getRequestBody();
        if (!body.tracker) {
            body.tracker = new McmaTracker({ id: uuidv4(), label: body["@type"] });
        }
        return true;
    }

    async onJobAssignmentCreationCompleted(requestContext: McmaApiRequestContext, jobAssignment: JobAssignment) {
        await this.workerInvoker.invoke(
            getWorkerFunctionId(requestContext.configVariables),
            {
                operationName: "ProcessJobAssignment",
                input: {
                    jobAssignmentDatabaseId: jobAssignment.id.replace(getPublicUrl(requestContext.configVariables), "")
                },
                tracker: jobAssignment.tracker
            }
        );
    }
}
