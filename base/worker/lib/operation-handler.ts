import { WorkerRequest } from "./worker-request";
import { ProviderCollection } from "./provider-collection";

export type OperationHandler = (providers: ProviderCollection, request: WorkerRequest, ctx?: any) => Promise<void>;
