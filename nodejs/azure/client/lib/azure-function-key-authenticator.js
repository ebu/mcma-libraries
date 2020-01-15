const { EncryptionHelper } = require("@mcma/encryption");
const { AuthProvider } = require("@mcma/client");

const DefaultDecryptionKey = typeof process !== "undefined" && process.env && process.env["FunctionKeyEncryptionKey"];
const FunctionKeyHeader = "x-functions-key";

function getFunctionKey(authContext, decryptionKey) {
    if (authContext && !authContext.isEncrypted) {
        return authContext.functionKey;
    }

    if (!decryptionKey || decryptionKey.length === 0) {
        throw new Error("Function key is encrypted, but a key for decrypting it was not found in the environment variables for this application.");
    }

    return EncryptionHelper.decrypt(authContext.functionKey, decryptionKey);
}

class AzureFunctionKeyAuthenticator {
    constructor(authContext, decryptionKey) {
        decryptionKey = decryptionKey || DefaultDecryptionKey;

        let _functionKey;
        Object.defineProperties(this, {
            functionKey: {
                get: () => _functionKey || (_functionKey = getFunctionKey(authContext, decryptionKey))
            }
        });

        this.sign = (config) => {
            config.headers[FunctionKeyHeader] = this.functionKey;
        };
    }
}

AuthProvider.prototype.addAzureFunctionKeyAuth = function addAzureFunctionKeyAuth(decryptionKey) {
    return this.add("AzureFunctionKey", (authContext) => new AzureFunctionKeyAuthenticator(authContext, decryptionKey));
};

module.exports = {
    AzureFunctionKeyAuthenticator
};