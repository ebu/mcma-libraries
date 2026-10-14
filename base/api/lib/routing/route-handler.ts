import { McmaApiRequestContext } from "../http/mcma-api-request-context.js";

export type McmaApiRouteHandler = (requestContext: McmaApiRequestContext) => Promise<void>;
