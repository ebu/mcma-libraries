import { McmaException } from "./mcma-exception";

export class EnvironmentVariables {
    private static instance: EnvironmentVariables;
    static getInstance(): EnvironmentVariables {
        if (!this.instance) {
            this.instance = new EnvironmentVariables();
        }
        return this.instance;
    }

    private readonly vars: { [key: string]: string | undefined };

    constructor(variables?: { [key: string]: string | undefined }) {
        if (!variables) {
            variables = process?.env;
        }

        this.vars = Object.assign({}, variables);
    }

    keys(): string[] {
        return Object.keys(this.vars);
    }

    get(name: string): string {
        if (!name) {
            throw new McmaException("Invalid name specified.");
        }

        const value = this.vars[name];

        if (value !== undefined) {
            return value;
        }

        throw new McmaException(`No environment variable found with name '${name}'.`);
    }

    getOptional(name: string, defaultValue?: string): string | undefined {
        if (!name) {
            throw new McmaException("Invalid name specified.");
        }

        const value = this.vars[name];

        if (value !== undefined) {
            return value;
        }

        return defaultValue;
    }
}
