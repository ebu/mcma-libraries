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
    };

    getOptionalContextVariable<T>(key: string, defaultValue?: T): T {
        if (!key) {
            throw new Error("Invalid key specified.");
        }

        const matchedKey = Object.keys(this.contextVariables).find(k => k.toLocaleLowerCase() === key.toLocaleLowerCase());
        if (!matchedKey) {
            return defaultValue;
        }

        return this.contextVariables[matchedKey];
    };
}