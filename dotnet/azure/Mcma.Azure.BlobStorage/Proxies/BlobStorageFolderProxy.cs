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
            var fileLocator = Locator.FileLocator(fileName);
            var blobRef = Container.GetBlockBlobReference(fileLocator.FilePath);
            await blobRef.UploadFromStreamAsync(readFrom);
            return fileLocator;
        }

        public async Task<BlobStorageFileLocator> PutAsTextAsync(string fileName, string content)
            => await PutAsync(fileName, new MemoryStream(Encoding.UTF8.GetBytes(content)));
    }
}
