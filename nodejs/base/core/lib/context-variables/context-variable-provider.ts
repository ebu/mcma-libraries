import { McmaException } from "../mcma-exception";

function isContextVariableProvider(x: any): x is ContextVariableProvider {
    return !!x?.getAllContextVariables;
}

export class ContextVariableProvider {
    constructor(private _contextVariables: { [key: string]: any } = {}) {}

    getAllContextVariables(): { [key: string]: any } {
        return this._contextVariables;
    }

    getRequiredContextVariable<T>(key: string): T {
        if (!key) {
            throw new McmaException("Invalid key specified.");
        }

        const matchedKey = Object.keys(this._contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
        if (!matchedKey) {
            throw new McmaException(`Required context variable with key "${key}" is missing.`);
        }

        return this._contextVariables[matchedKey];
    }

    getOptionalContextVariable<T>(key: string, defaultValue?: T): T {
        if (!key) {
            throw new McmaException("Invalid key specified.");
        }

        const matchedKey = Object.keys(this._contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
        if (!matchedKey) {
            return defaultValue;
        }

        return this._contextVariables[matchedKey];
    }

    setContextVariable(key: string, value: any): void {
        this._contextVariables[key] = value;
    }

    merge(contextVariables: ContextVariableProvider)
    merge(contextVariables: { [key: string]: any })
    merge(contextVariables: ContextVariableProvider | { [key: string]: any }) {
        if (isContextVariableProvider(contextVariables)) {
            contextVariables = contextVariables.getAllContextVariables();
        }

        for (const key of Object.keys(contextVariables)) {
            this._contextVariables[key] = contextVariables[key];
        }

        return this;
    }
}
