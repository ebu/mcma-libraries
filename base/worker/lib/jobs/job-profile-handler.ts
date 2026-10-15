import { Job } from "@mcma/core";
import { ProcessJobAssignmentHelper } from "./process-job-assignment-helper.js";
import { ProviderCollection } from "../provider-collection.js";

export type JobProfileHandler<T extends Job> =
    (providers: ProviderCollection, workerJobHelper: ProcessJobAssignmentHelper<T>, ctx: any) => Promise<void>;
