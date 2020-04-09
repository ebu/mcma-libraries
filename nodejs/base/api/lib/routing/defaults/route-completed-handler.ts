import { McmaApiRequestContext } from "../../http/mcma-api-request-context";
export type RouteCompletedHandler<T> = (requestContext: McmaApiRequestContext, resource: T) => Promise<T>;
