function isContextVariableProvider(x: any): x is ContextVariableProvider {
    return !!x?.getAllContextVariables;
}

export class ContextVariableProvider {
    constructor(private contextVariables: { [key: string]: any } = {}) {}

    getAllContextVariables(): { [key: string]: any } {
        return this.contextVariables;
    }

    getRequiredContextVariable<T>(key: string): T {
        if (!key) {
            throw new Error("Invalid key specified.");
        }

        const matchedKey = Object.keys(this.contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
        if (!matchedKey) {
            throw new Error(`Required context variable with key "${key}" is missing.`);
        }

        return this.contextVariables[matchedKey];
    }

    getOptionalContextVariable<T>(key: string, defaultValue?: T): T {
        if (!key) {
            throw new Error("Invalid key specified.");
        }

        const matchedKey = Object.keys(this.contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
        if (!matchedKey) {
            return defaultValue;
        }

        return this.contextVariables[matchedKey];
    }

    setContextVariable(key: string, value: any): void {
        this.contextVariables[key] = value;
    }

    merge(contextVariables: ContextVariableProvider)
    merge(contextVariables: { [key: string]: any })
    merge(contextVariables: ContextVariableProvider | { [key: string]: any }) {
        if (isContextVariableProvider(contextVariables)) {
            contextVariables = contextVariables.getAllContextVariables();
        }

        for (var key of Object.keys(contextVariables)) {
            this.contextVariables[key] = contextVariables[key];
        }

        return this;
    }
}