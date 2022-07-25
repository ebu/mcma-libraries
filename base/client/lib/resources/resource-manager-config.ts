import { HttpClientConfig } from "../http";

export interface ResourceManagerConfig {
    servicesUrl: string;
    servicesAuthType?: string;
    httpClientConfig?: HttpClientConfig;
}
