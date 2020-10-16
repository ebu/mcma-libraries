export function parsePathAndGuid(id: string): { path: string, guid: string } {
    const lastSlashIndex = id.lastIndexOf("/");
    return {
        path: lastSlashIndex > 0 ? id.substr(0, lastSlashIndex) : null,
        guid: id.substr(lastSlashIndex + 1)
    };
}