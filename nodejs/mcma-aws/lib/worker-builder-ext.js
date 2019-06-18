const { WorkerBuilder } = require("mcma-worker");
const { dynamoDbTableProvider } = require("./dynamo-db-table");
const { awsResourceManagerProvider } = require("./resource-manager-provider");

WorkerBuilder.prototype.useAwsJobDefaults = function useAwsJobDefaults() {
    const workerBuilder = this;
    return {
        handleJobsOfType: (type, configure) => {
            return workerBuilder.handleJobsOfType(type, dynamoDbTableProvider(type), awsResourceManagerProvider(), configure)
        }
    };
}