export function parsePartitionKeyAndGuid(id: string): { partitionKey: string, guid: string } {
    const lastSlashIndex = id.lastIndexOf("/");
    return {
        partitionKey: lastSlashIndex > 0 ? id.substring(0, lastSlashIndex) : null,
        guid: id.substring(lastSlashIndex + 1)
    };
}
