import { Configuration } from "@azure/msal";

export interface ConfigurationWithTenant extends Configuration {
    tenant?: string;
}