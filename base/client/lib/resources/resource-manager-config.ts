import { HttpClientConfig } from "../http/index.js";

export interface ResourceManagerConfig {
    serviceRegistryUrl: string;
    serviceRegistryAuthType?: string;
    httpClientConfig?: HttpClientConfig;
}
