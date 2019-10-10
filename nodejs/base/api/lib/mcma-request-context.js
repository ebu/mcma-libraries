const { ContextVariableProvider } = require("@mcma/core");
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
