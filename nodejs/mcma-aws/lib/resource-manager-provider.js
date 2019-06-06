const { getAwsV4ResourceManager } = require('./auth');

const awsResourceManagerProvider = (AWS) => {
    return {
        getResourceManager: (contextVariableProvider) => getAwsV4ResourceManager(contextVariableProvider, AWS)
    };
}

module.exports = {
    awsResourceManagerProvider
};