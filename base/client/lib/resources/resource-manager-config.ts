import { HttpClientConfig } from "../http";

export interface ResourceManagerConfig {
    serviceRegistryUrl: string;
    serviceRegistryAuthType?: string;
    httpClientConfig?: HttpClientConfig;
}
