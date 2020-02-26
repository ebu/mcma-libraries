import { EncryptionHelper } from "@mcma/encryption";
import { Authenticator, HttpRequestConfig } from "@mcma/client";

import { AzureFunctionKeyAuthContext } from "./function-key-auth-context";

const DefaultDecryptionKey = typeof process !== "undefined" && process.env && process.env["FunctionKeyEncryptionKey"];
const FunctionKeyHeader = "x-functions-key";

export class AzureFunctionKeyAuthenticator implements Authenticator {
    private _functionKey: string;

    constructor(private authContext: AzureFunctionKeyAuthContext, private decryptionKey?: string) {
        decryptionKey = decryptionKey || DefaultDecryptionKey;
    }

    get functionKey(): string { return this._functionKey || (this._functionKey = this.getFunctionKey()); }

    private getFunctionKey() {
        if (this.authContext && !this.authContext.isEncrypted) {
            return this.authContext.functionKey;
        }

        if (!this.decryptionKey || this.decryptionKey.length === 0) {
            throw new Error("Function key is encrypted, but a key for decrypting it was not found in the environment variables for this application.");
        }

        return EncryptionHelper.decrypt(this.authContext.functionKey, this.decryptionKey);
    }

    async sign(config: HttpRequestConfig): Promise<void> {
        config.headers[FunctionKeyHeader] = this.functionKey;
    }
}