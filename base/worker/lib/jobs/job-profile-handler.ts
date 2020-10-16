import { Job } from "@mcma/core";
import { ProcessJobAssignmentHelper } from "./process-job-assignment-helper";
import { ProviderCollection } from "../provider-collection";

export type JobProfileHandler<T extends Job> =
    (providers: ProviderCollection, workerJobHelper: ProcessJobAssignmentHelper<T>, ctx: any) => Promise<void>;
