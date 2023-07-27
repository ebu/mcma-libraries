import { McmaApiRequestContext } from "./mcma-api-request-context";

export type McmaApiMiddleware = (requestContext: McmaApiRequestContext, next: (requestContext: McmaApiRequestContext) => Promise<void>) => Promise<void>;
