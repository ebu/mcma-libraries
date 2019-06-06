const { WorkerBuilder } = require('mcma-worker');
const { dynamoDbTableProvider } = require('./dynamo-db-table');
const { awsResourceManagerProvider } = require('./resource-manager-provider');

WorkerBuilder.prototype.awsHandleJobsOfType = function awsHandleJobsOfType(AWS, type, configure) {
    return this.handleJobsOfType(type, dynamoDbTableProvider(AWS, type), awsResourceManagerProvider(AWS), configure);
}