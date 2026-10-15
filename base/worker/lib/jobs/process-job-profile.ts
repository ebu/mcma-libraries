import { Job } from "@mcma/core";
import { JobProfileHandler } from "./job-profile-handler.js";

export interface ProcessJobProfile<T extends Job> {
    name: string;
    execute: JobProfileHandler<T>;
}
