using System;
using System.Linq;
using Mcma.Core.ContextVariables;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace Mcma.Azure.BlobStorage.Proxies
{
    public static class BlobStorageProxyExtensions
    {
        private static CloudBlobClient GetBlobClient(string connectionString)
        {
            if (!CloudStorageAccount.TryParse(connectionString, out var storageAccount))
                throw new Exception("Invalid connection string.");

            return storageAccount.CreateCloudBlobClient();
        }

        private static CloudBlobClient GetBlobClient(IContextVariableProvider contextVariableProvider, string storageAccountName)
        {
            var accountNameSetting =
                contextVariableProvider.GetAllContextVariables()
                                       .FirstOrDefault(kvp => kvp.Key.EndsWith("StorageAccountName", StringComparison.OrdinalIgnoreCase)
                                                              && kvp.Value.Equals(storageAccountName, StringComparison.OrdinalIgnoreCase));
            if (accountNameSetting.Key == null)
                throw new Exception($"Storage account '{storageAccountName}' is not configured.");
            
            return GetBlobClient(
                contextVariableProvider.GetRequiredContextVariable(
                    accountNameSetting.Key.Substring(0, accountNameSetting.Key.Length - 4) + "ConnectionString"));
        }

        public static BlobStorageFileProxy Proxy(this BlobStorageFileLocator locator, string connectionString)
            => new BlobStorageFileProxy(locator, GetBlobClient(connectionString));

        public static BlobStorageFileProxy Proxy(this BlobStorageFileLocator locator, IContextVariableProvider contextVariableProvider)
            => new BlobStorageFileProxy(locator, GetBlobClient(contextVariableProvider, locator.StorageAccountName));

        public static BlobStorageFolderProxy Proxy(this BlobStorageFolderLocator locator, string connectionString)
            => new BlobStorageFolderProxy(locator, GetBlobClient(connectionString));

        public static BlobStorageFolderProxy Proxy(this BlobStorageFolderLocator locator, IContextVariableProvider contextVariableProvider)
            => new BlobStorageFolderProxy(locator, GetBlobClient(contextVariableProvider, locator.StorageAccountName));
    }
}