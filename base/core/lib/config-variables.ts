import { McmaException } from "./mcma-exception";

export class ConfigVariables {
    private static instance: ConfigVariables;
    static getInstance(): ConfigVariables {
        if (!this.instance) {
            this.instance = new ConfigVariables();
        }
        return this.instance;
    }

    private readonly _keys: string[];
    private readonly _vars: { [key: string]: string | undefined };

    constructor(variables?: { [key: string]: string | undefined }) {
        if (!variables) {
            variables = process?.env;
        }

        this._keys = variables ? Object.keys(variables) : [];
        this._vars = {};
        for (const key of this._keys) {
            this._vars[key.toUpperCase()] = variables[key];
        }
    }

    keys(): string[] {
        return this._keys;
    }

    get(name: string): string {
        if (!name) {
            throw new McmaException("Invalid name specified.");
        }

        const value = this._vars[name.toUpperCase()];

        if (value !== undefined) {
            return value;
        }

        throw new McmaException(`No environment variable found with name '${name}'.`);
    }

    getOptional(name: string, defaultValue?: string): string | undefined {
        if (!name) {
            throw new McmaException("Invalid name specified.");
        }

        const value = this._vars[name.toUpperCase()];

        if (value !== undefined) {
            return value;
        }

        return defaultValue;
    }
}
