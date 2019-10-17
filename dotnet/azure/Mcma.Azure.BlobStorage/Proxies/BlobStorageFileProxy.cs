using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Storage.Blob;

namespace Mcma.Azure.BlobStorage.Proxies
{
    public class BlobStorageFileProxy : BlobStorageProxy<BlobStorageFileLocator>
    {
        internal BlobStorageFileProxy(BlobStorageFileLocator locator, CloudBlobClient client)
            : base(locator, client)
        {
            Blob = Container.GetBlockBlobReference(locator.FilePath);
        }

        public CloudBlockBlob Blob { get; }

        public async Task<Stream> GetAsync(Stream writeTo = null)
        {
            writeTo = writeTo ?? new MemoryStream();

            await Blob.DownloadToStreamAsync(writeTo);

            return writeTo;
        }

        public async Task<string> GetAsTextAsync()
        {
            var memoryStream = new MemoryStream();
            await GetAsync(memoryStream);
            return Encoding.UTF8.GetString(memoryStream.ToArray());
        }

        public string GetPublicReadOnlyUrl(TimeSpan? validFor = null)
        {
            var sasToken = Blob.GetSharedAccessSignature(new SharedAccessBlobPolicy
            {
                Permissions = SharedAccessBlobPermissions.Read,
                SharedAccessExpiryTime = DateTime.UtcNow.Add(validFor ?? TimeSpan.FromMinutes(15))
            });

            return Blob.Uri + sasToken;
        }
    }
}
