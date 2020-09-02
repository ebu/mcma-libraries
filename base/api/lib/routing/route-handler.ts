import { McmaApiRequestContext } from "../http/mcma-api-request-context";

export type McmaApiRouteHandler = (requestContext: McmaApiRequestContext) => Promise<void>;
