import { ConfigVariables, Logger, LoggerProvider, McmaException, McmaResource, McmaTracker, Utils } from "@mcma/core";
import { McmaHeaders } from "@mcma/client";
import { HttpStatusCode } from "./http-statuses";
import { McmaApiRequest } from "./mcma-api-request";
import { McmaApiResponse } from "./mcma-api-response";

export class McmaApiRequestContext {
    public readonly response = new McmaApiResponse();

    constructor(public readonly request: McmaApiRequest, private loggerProvider: LoggerProvider, public readonly configVariables: ConfigVariables) {
    }

    hasRequestBody() {
        return !!this.request.body;
    }

    getRequestBody<T = any>(): T {
        return this.request.body;
    }

    setResponseBody(body: any) {
        this.response.body = body;
    }

    setResponseResourceCreated(resource: McmaResource) {
        this.response.headers["Location"] = resource.id;
        this.response.statusCode = HttpStatusCode.Created;
        this.response.body = resource;
    }

    setResponseError(code: number, message?: string) {
        if (code < 400 || code > 599) {
            throw new McmaException("McmaApiRequestContext.setResponseError can only be used to handle 4xx or 5xx errors");
        }
        this.response.statusCode = code;
        this.response.errorMessage = message;
    }

    setResponseBadRequestDueToMissingBody() {
        this.setResponseError(HttpStatusCode.BadRequest, "Missing request body.");
    }

    setResponseResourceNotFound() {
        this.setResponseError(HttpStatusCode.NotFound, "No resource found on path '" + this.request.path + "'.");
    }

    getTracker(): McmaTracker | undefined {
        // try to get the tracker from the headers or query string first
        const headerOrQueryParam =
            (this.request && this.request.headers && this.request.headers[McmaHeaders.tracker]) ||
            (this.request && this.request.queryStringParameters && this.request.queryStringParameters[McmaHeaders.tracker]);
        if (headerOrQueryParam) {
            try {
                const trackerDataJson = Utils.fromBase64(headerOrQueryParam);
                if (trackerDataJson) {
                    return new McmaTracker(JSON.parse(trackerDataJson));
                }
            } catch (e) {
                this.loggerProvider?.get(this.request.id)?.warn(`Failed to convert text in header or query param 'mcmaTracker' to an McmaTracker object. Error: ${e}`);
            }
        }

        // if we didn't find it in the header or query string, try the body
        return this.request?.body?.tracker;
    }

    getLogger(): Logger | undefined {
        return this.loggerProvider?.get(this.request.id, this.getTracker());
    }
}
