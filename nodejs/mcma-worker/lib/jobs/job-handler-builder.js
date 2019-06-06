const { WorkerBuilder } = require('../builders/worker-builder');
const { ProcessJobAssignment, ProcessJobAssignmentHandler } = require('./process-job-assignment');

class JobHandlerBuilder {
    constructor(jobType, dbTableProvider, resourceManagerProvider) {
        const jobHandler = new ProcessJobAssignmentHandler(jobType, dbTableProvider, resourceManagerProvider);

        this.addProfile = (profileName, profileHandler) => {
            if (typeof profileName === 'function' && !profileHandler) {
                profileHandler = profileName;
                profileName = profileHandler.name;
            }
            if (!profileName || typeof profileName !== 'string' || profileName.length === 0) {
                throw new Error('profileName must be a non-empty string.');
            }
            if (!profileHandler) {
                throw new Error('handler must be provided.');
            }

            if (typeof profileHandler === 'function') {
                if (profileHandler.prototype) {
                    const handlerObj = new profileHandler();
                    if (!handlerObj.execute) {
                        throw new Error('profileHandler object must define a function called "execute"');
                    }
                    profileHandler = handlerObj.execute;
                }
            } else if (typeof profileHandler === 'object') {
                if (!profileHandler.execute) {
                    throw new Error('Handler object must define a function named "execute"');
                }
                profileHandler = profileHandler.execute;
            } else {
                throw new Error('Handler must be a function or an object');
            }

            jobHandler.profileHandlers[profileName] = profileHandler;
        };

        this.applyTo = (workerBuilder) => 
            workerBuilder.handleOperation(
                ProcessJobAssignment,
                ProcessJobAssignment.operationName,
                configureOperation => configureOperation.handle(jobHandler)
            );
    }
}

WorkerBuilder.prototype.handleJobsOfType = function handleJobsOfType(jobType, dbTableProvider, resourceManagerProvider, configure) {
    const jobHandlerBuilder = new JobHandlerBuilder(jobType, dbTableProvider, resourceManagerProvider);
    configure(jobHandlerBuilder);
    return jobHandlerBuilder.applyTo(this);
}