import { ContextVariableProvider, Exception, McmaTrackerProperties } from "@mcma/core";

export interface WorkerRequestProperties {
    operationName: string;
    contextVariables?: { [key: string]: string };
    input?: { [key: string]: any };
    tracker?: McmaTrackerProperties;
}

export class WorkerRequest extends ContextVariableProvider {
    private _operationName: string;
    private _input: { [key: string]: any };
    private _tracker?: McmaTrackerProperties;

    constructor(request: WorkerRequestProperties) {
        super(request && request.contextVariables);

        const operationName = request && request.operationName;
        if (!operationName || typeof operationName !== "string") {
            throw new Exception("operationName must be a non-empty string.");
        }

        this._operationName = operationName;
        this._input = request && request.input;
        this._tracker = request && request.tracker;
    }

    get operationName() { return this._operationName; }
    get input() { return this._input; }
    get tracker() { return this._tracker; }
}