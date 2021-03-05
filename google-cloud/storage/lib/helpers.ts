export function buildCloudStorageUrl(bucket: string, filename: string) {
    return `https://storage.cloud.google.com/${bucket}/${filename}`;
}
