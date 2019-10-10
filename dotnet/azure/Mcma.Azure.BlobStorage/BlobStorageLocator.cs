using Mcma.Core;

namespace Mcma.Azure.BlobStorage
{
    public abstract class BlobStorageLocator : IUrlLocator
    {
        /// <summary>
        /// Gets or sets the name of the storage account
        /// </summary>
        /// <value></value>
        public string StorageAccountName { get; }

        /// <summary>
        /// Gets or sets the share on which the file resides
        /// </summary>
        public string Container { get; set; }

        /// <summary>
        /// Gets the url to the file on Blob storage
        /// </summary>
        public abstract string Url { get; }
    }
}
