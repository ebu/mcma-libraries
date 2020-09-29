import { Configuration } from "@azure/msal-node";

export type ConfigurationWithTenant = Configuration & { tenant: string };