import { ContextVariableProvider, McmaException, McmaTrackerProperties } from "@mcma/core";

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
        const operationName = request?.operationName;
        if (!operationName || typeof operationName !== "string") {
            throw new McmaException("operationName must be a non-empty string.");
        }

        super(request.contextVariables);

        this._operationName = operationName;
        this._input = request.input;
        this._tracker = request.tracker;
    }

    get operationName() { return this._operationName; }
    get input() { return this._input; }
    get tracker() { return this._tracker; }
}