const { ContextVariableProvider, Exception, McmaTracker, Utils } = require("@mcma/core");
const { McmaHeaders } = require("@mcma/client");
const { HttpStatusCode } = require("./http-statuses");

class McmaApiRequest {
    constructor(config) {
        this.path = (config && config.path) || null;
        this.httpMethod = (config && config.httpMethod) || null;
        this.headers = (config && config.headers) || {};
        this.pathVariables = (config && config.pathVariables) || {};
        this.queryStringParameters = (config && config.queryStringParameters) || {};
        this.body = (config && config.body) || null;
    }
}

class McmaApiResponse {
    constructor() {
        this.statusCode = 0;
        this.statusMessage = null;
        this.headers = {};
        this.body = null;
    }
}

class McmaApiRequestContext extends ContextVariableProvider {
    constructor(request, contextVariables) {
        super(contextVariables);

        this.request = request;
        this.response = new McmaApiResponse();
    }

    hasRequestBody() {
        return !!this.request.body;
    }

    getRequestBody() {
        return this.request.body;
    }

    setResponseStatusCode(statusCode, statusMessage) {
        this.response.statusCode = statusCode;
        this.response.statusMessage = statusMessage;
    }

    setResponseBody(body) {
        this.response.body = body;
    }

    setResponseBadRequestDueToMissingBody() {
        this.setResponseStatusCode(HttpStatusCode.BAD_REQUEST, "Missing request body.");
    }

    setResponseResourceCreated(resource) {
        this.response.headers["Location"] = resource.id;
        this.setResponseStatusCode(HttpStatusCode.CREATED);
        this.setResponseBody(resource);
    }

    setResponseResourceNotFound() {
        this.setResponseStatusCode(HttpStatusCode.NOT_FOUND, "No resource found on path '" + this.request.path + "'.");
    }

    getTracker() {
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
                //Logger.warn(`Failed to convert text in header or query param 'mcmaTracker' to an McmaTracker object. Error: ${e}`);
                throw new Exception("Invalid MCMA tracker.", e, this.request);
            }
        }

        // if we didn't find it in the header or query string, try the body
        return this.request && this.request.body && this.request.body.tracker;
    }
}

ContextVariableProvider.prototype.publicUrl = function publicUrl() {
    return this.getRequiredContextVariable("PublicUrl");
};

ContextVariableProvider.prototype.workerFunctionId = function workerFunctionId() {
    return this.getRequiredContextVariable("WorkerFunctionId");
};

module.exports = {
    McmaApiRequest,
    McmaApiResponse,
    McmaApiRequestContext
};
