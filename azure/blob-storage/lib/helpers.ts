export function buildBlobStorageUrl(account: string, container: string, blobName: string): string {
    return `https://${account}.blob.core.windows.net/${container}/${blobName}`;
}
