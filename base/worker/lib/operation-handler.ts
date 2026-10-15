import { WorkerRequest } from "./worker-request.js";
import { ProviderCollection } from "./provider-collection.js";

export type OperationHandler = (providers: ProviderCollection, request: WorkerRequest, ctx?: any) => Promise<void>;
