
using System;
using System.Security.Cryptography;
using System.Text;

using Mcma.Core.Utility;

namespace Mcma.Aws.Authentication
{
    public static class AwsSigningExtensions
    {
        public static string Hash(this HashAlgorithm hashAlgorithm, string toHash)
            => toHash != null ? hashAlgorithm.ComputeHash(Encoding.UTF8.GetBytes(toHash)).HexEncode() : string.Empty;

        public static byte[] UseToSign(this byte[] key, string data) => new HMACSHA256(key).ComputeHash(Encoding.UTF8.GetBytes(data));
    }
}