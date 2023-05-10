export function parsePathAndGuid(id: string): { path: string, guid: string } {
    const lastSlashIndex = id.lastIndexOf("/");
    return {
        path: lastSlashIndex > 0 ? id.substring(0, lastSlashIndex) : null,
        guid: id.substring(lastSlashIndex + 1)
    };
}
