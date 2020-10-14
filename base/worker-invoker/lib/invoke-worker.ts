import { WorkerRequestProperties } from "./worker-request-properties";

export type InvokeWorker = (workerFunctionId: string, workerRequest: WorkerRequestProperties) => Promise<void>;
