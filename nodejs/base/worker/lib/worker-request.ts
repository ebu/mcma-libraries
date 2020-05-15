import { ContextVariableProvider, Logger, McmaException, McmaTrackerProperties } from "@mcma/core";

export interface WorkerRequestProperties {
    operationName: string;
    contextVariables?: { [key: string]: string };
    input?: { [key: string]: any };
    tracker?: McmaTrackerProperties;
}

export class WorkerRequest extends ContextVariableProvider {
    private readonly _operationName: string;
    private readonly _input: { [key: string]: any };
    private readonly _tracker?: McmaTrackerProperties;
    private readonly _logger?: Logger;

    constructor(request: WorkerRequestProperties, logger?: Logger) {
        const operationName = request?.operationName;
        if (!operationName || typeof operationName !== "string") {
            throw new McmaException("operationName must be a non-empty string.");
        }

        super(request.contextVariables);

        this._operationName = operationName;
        this._input = request.input;
        this._tracker = request.tracker;
        this._logger = logger;
    }

    get operationName() { return this._operationName; }
    get input() { return this._input; }
    get tracker() { return this._tracker; }
    get logger() { return this._logger; }
}
