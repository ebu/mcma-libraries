export function parsePartitionKeyAndGuid(id: string): { partitionKey: string, guid: string } {
    const lastSlashIndex = id.lastIndexOf("/");
    return {
        partitionKey: lastSlashIndex > 0 ? id.substr(0, lastSlashIndex) : null,
        guid: id.substr(lastSlashIndex + 1)
    };
}