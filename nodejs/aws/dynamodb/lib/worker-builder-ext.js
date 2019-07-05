// const { JobAssignment } = require("mcma-core");
// const { WorkerBuilder } = require("mcma-worker");
// const { DynamoDbTableProvider } = require("./dynamo-db-table");
// const { getAwsV4ResourceManager } = require("../../mcma-aws/lib/auth");

// WorkerBuilder.prototype.useAwsJobDefaults = function useAwsJobDefaults() {
//     const workerBuilder = this;
//     return {
//         handleJobsOfType: (type, configure) => {
//             return workerBuilder.handleJobsOfType(type, new DynamoDbTableProvider(JobAssignment), getAwsV4ResourceManager, configure);
//         }
//     };
// }