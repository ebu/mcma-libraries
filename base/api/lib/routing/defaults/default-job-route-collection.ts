import { v4 as uuidv4 } from "uuid";

import { JobAssignment, JobAssignmentProperties, JobStatus, McmaTracker } from "@mcma/core";
import { DocumentDatabaseTableProvider, getTableName } from "@mcma/data";
import { getWorkerFunctionId, WorkerInvoker } from "@mcma/worker-invoker";

import { DefaultRouteCollection } from "./default-route-collection";
import { getPublicUrl } from "../../config-variables-ext";
import { HttpStatusCode, McmaApiRequestContext } from "../../http";

export class DefaultJobRouteCollection extends DefaultRouteCollection<JobAssignment> {
    constructor(
        private dbTableProvider: DocumentDatabaseTableProvider,
        private workerInvoker: WorkerInvoker,
        root?: string
    ) {
        super(dbTableProvider, JobAssignment, root);

        this.create.onStarted = reqCtx => this.onJobAssignmentCreationStarted(reqCtx);
        this.create.onCompleted = (reqCtx, jobAssignment) => this.onJobAssignmentCreationCompleted(reqCtx, jobAssignment);

        this.remove("update");
        this.addRoute("POST", "/job-assignments/{id}/cancel", this.processCancel.bind(this))
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

    async processCancel(requestContext: McmaApiRequestContext) {
        const request = requestContext.request;

        const table = await this.dbTableProvider.get(getTableName());

        const jobAssignmentDatabaseId = "/job-assignments/" + request.pathVariables.id;
        const jobAssignment = await table.get<JobAssignmentProperties>(jobAssignmentDatabaseId);
        if (!jobAssignment) {
            requestContext.setResponseResourceNotFound();
            return;
        }

        if (jobAssignment.status === JobStatus.Completed ||
            jobAssignment.status === JobStatus.Failed ||
            jobAssignment.status === JobStatus.Canceled) {
            requestContext.setResponseError(HttpStatusCode.Conflict, "JobAssignment is already in a final state");
            return;
        }

        await this.workerInvoker.invoke(
            getWorkerFunctionId(),
            {
                operationName: "ProcessCancel",
                input: {
                    jobAssignmentDatabaseId
                },
                tracker: jobAssignment.tracker
            }
        );
    }
}
