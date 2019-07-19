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

    isBadRequestDueToMissingBody() {
        let resource = this.request && this.request.body;
        if (!resource) {
            this.response.statusCode = HttpStatusCode.BAD_REQUEST;
            this.response.statusMessage = "Missing request body.";
        }
        return resource;
    }
    
    resourceCreated(resource) {
        this.response.statusCode = HttpStatusCode.CREATED;
        this.response.headers["Location"] = resource.id;
        this.response.body = resource;
    }
    
    resourceIfFound(resource, setBody = true) {
        if (!resource) {
            this.response.statusCode = HttpStatusCode.NOT_FOUND;
            this.response.statusMessage = "No resource found on path '" + this.request.path + "'.";
            return false;
        }
    
        if (setBody) {
            this.response.body = resource;
        }
    
        return true;
    }
}

ContextVariableProvider.prototype.publicUrl = function publicUrl() {
    return this.getRequiredContextVariable("PublicUrl");
}

ContextVariableProvider.prototype.workerFunctionId = function workerFunctionId() {
    return this.getRequiredContextVariable("WorkerFunctionId");
}

module.exports = {
    McmaApiRequest,
    McmaApiResponse,
    McmaApiRequestContext
};