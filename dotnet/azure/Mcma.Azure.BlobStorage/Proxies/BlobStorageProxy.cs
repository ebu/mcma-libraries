using Microsoft.Azure.Storage.Blob;

namespace Mcma.Azure.BlobStorage.Proxies
{
    public abstract class BlobStorageProxy<T> where T : BlobStorageLocator
    {
        protected BlobStorageProxy(T locator, CloudBlobClient client)
        {
            Locator = locator;
            Client = client;
            Container = Client.GetContainerReference(Locator.Container);
        }

        public T Locator { get; }

        public CloudBlobClient Client { get; }

        public CloudBlobContainer Container { get; }
    }
}
