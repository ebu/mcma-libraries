using System;
using System.Security.Cryptography;
using System.Text;
using Mcma.Core.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mcma.Encryption
{
    public static class EncryptionHelper
    {
        public static string ExportJson(this RSA rsa, bool includePrivate)
            => Convert.ToBase64String(Encoding.UTF8.GetBytes(rsa.ExportParameters(includePrivate).ToMcmaJson().ToString(Formatting.None)));

        public static void ImportJson(this RSA rsa, string json)
            => rsa.ImportParameters(JObject.Parse(Encoding.UTF8.GetString(Convert.FromBase64String(json))).ToMcmaObject<RSAParameters>());

        public static (string, string) GenerateNewKeys()
        {
            using (var rsaCryptoServiceProvider = RSA.Create())
                return (rsaCryptoServiceProvider.ExportJson(true), rsaCryptoServiceProvider.ExportJson(false));
        }

        public static string Encrypt(string toEncrypt, string publicKeyJson)
        {
            using (var rsa = RSA.Create())
            {
                rsa.ImportJson(publicKeyJson);

                var encryptedBytes = 
#if NET452
                    rsa.EncryptValue(Encoding.UTF8.GetBytes(toEncrypt));
#else
                    rsa.Encrypt(Encoding.UTF8.GetBytes(toEncrypt), RSAEncryptionPadding.Pkcs1);
#endif

                return Convert.ToBase64String(encryptedBytes);
            }
        }

        public static string Decrypt(string toDecrypt, string privateKeyJson)
        {
            using (var rsa = RSA.Create())
            {
                rsa.ImportJson(privateKeyJson);

                var decryptedBytes = 
#if NET452
                    rsa.DecryptValue(Convert.FromBase64String(toDecrypt));
#else
                    rsa.Decrypt(Convert.FromBase64String(toDecrypt), RSAEncryptionPadding.Pkcs1);
#endif

                return Encoding.UTF8.GetString(decryptedBytes);
            }
        }
    }
}
