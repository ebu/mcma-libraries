import { McmaApiRequestContext } from "./mcma-api-request-context.js";

export interface McmaApiMiddleware {
    execute(requestContext: McmaApiRequestContext, next: (requestContext: McmaApiRequestContext) => Promise<void>): Promise<void>;
}
