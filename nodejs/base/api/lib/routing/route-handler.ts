import { McmaApiRequestContext } from "../http/mcma-api-request-context";

export type McmaApiRouteHandler = (requestContxt: McmaApiRequestContext) => Promise<void>;
