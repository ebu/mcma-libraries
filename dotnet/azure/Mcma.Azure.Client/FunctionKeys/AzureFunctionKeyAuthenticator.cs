using System;
using System.Net.Http;
using System.Threading.Tasks;
using Mcma.Client;
using Mcma.Encryption;

namespace Mcma.Azure.Client.FunctionKeys
{
    public class AzureFunctionKeyAuthenticator : IAuthenticator
    {
        public AzureFunctionKeyAuthenticator(AzureFunctionKeyAuthContext authContext, string decryptionKey = null)
        {
            FunctionKey = new Lazy<string>(() => GetFunctionKey(authContext));
            DecryptionKey = decryptionKey ?? Environment.GetEnvironmentVariable(AzureConstants.FunctionKeyEncryptionKeySetting);
        }

        private Lazy<string> FunctionKey { get; }

        private string DecryptionKey { get; }

        public Task SignAsync(HttpRequestMessage request)
        {
            request.Headers.Add(AzureConstants.FunctionKeyHeader, FunctionKey.Value);
#if NET452
            return Task.FromResult(true);
#else
            return Task.CompletedTask;
#endif
        }

        private string GetFunctionKey(AzureFunctionKeyAuthContext authContext)
        {
            if (!authContext.IsEncrypted)
                return authContext.FunctionKey;

            if (string.IsNullOrWhiteSpace(DecryptionKey))
                throw new Exception($"Function key is encrypted, but a key for decrypting it was not found in the environment variables for this application.");

            return EncryptionHelper.Decrypt(authContext.FunctionKey, DecryptionKey);
        }
    }
}
