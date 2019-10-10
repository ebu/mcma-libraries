using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Storage.Blob;

namespace Mcma.Azure.BlobStorage.Proxies
{
    public class BlobStorageFolderProxy : BlobStorageProxy<BlobStorageFolderLocator>
    {
        internal BlobStorageFolderProxy(BlobStorageFolderLocator locator, CloudBlobClient client)
            : base(locator, client)
        {
        }

        public async Task<BlobStorageFileLocator> PutAsync(string fileName, Stream readFrom)
        {
            var blobRef = Container.GetBlockBlobReference(fileName);
            await blobRef.UploadFromStreamAsync(readFrom);
            return Locator.FileLocator(fileName);
        }

        public async Task<BlobStorageFileLocator> PutAsTextAsync(string fileName, string content)
            => await PutAsync(fileName, new MemoryStream(Encoding.UTF8.GetBytes(content)));
    }
}
