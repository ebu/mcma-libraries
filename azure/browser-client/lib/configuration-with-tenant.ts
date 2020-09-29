import { Configuration } from "@azure/msal-browser";

export type ConfigurationWithTenant = Configuration & { tenant: string };