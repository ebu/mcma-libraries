export function parsePartitionKey(id: string): string {
    const lastSlashIndex = id.lastIndexOf("/");
    return lastSlashIndex > 0 ? id.substr(0, lastSlashIndex) : null;
}