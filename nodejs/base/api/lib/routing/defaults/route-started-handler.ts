import { McmaApiRequestContext } from "../../http/mcma-api-request-context";
export type RouteStartedHandler = (requestContext: McmaApiRequestContext) => Promise<boolean>;
