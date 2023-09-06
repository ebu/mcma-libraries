import { Secret } from "./secret";

export abstract class SecretsProvider {
    abstract get(secretId: string): Promise<string>;

    async getAs<TSecret extends Secret = Secret>(secretId: string): Promise<TSecret> {
        const secret = await this.get(secretId);
        return JSON.parse(secret) as TSecret;
    }
}
