const DbTable = require('./db-table');

DbTable.prototype.getAndThrowIfNotFound = async function getAndThrowIfNotFound(id) {
    const resource = await this.get(id);
    if (!resource) {
        throw new Error('Resource of type ' + this.type + ' with id ' + id + ' was not found.');
    }
    return resource;
}

DbTable.prototype.updateJobStatus = async function updateJobStatus(jobId, status, statusMessage) {
    const jobBase = await this.getAndThrowIfNotFound(jobId);
    jobBase.status = status;
    jobBase.statusMessage = statusMessage;
    await this.put(id, jobBase);
    return jobBase;
}