import { WorkerRequest } from "./worker-request";
import { ProviderCollection } from "./provider-collection";

export type OperationFilter = (providers: ProviderCollection, request: WorkerRequest, ctx?: any) => Promise<boolean>;
