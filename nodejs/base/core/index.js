//"use strict";
const {
    onResourceCreate, onResourceUpsert, McmaObject, McmaTracker, Resource, Service, ResourceEndpoint, BMContent,
    BMEssence, DescriptiveMetadata, TechnicalMetadata, JobProfile, Locator, JobStatus, JobBase, JobProcess,
    JobAssignment, Job, JobParameter, JobParameterBag, AIJob, AmeJob, CaptureJob, QAJob, TransferJob, TransformJob,
    WorkflowJob, Notification, NotificationEndpoint, Exception,
} = require("./lib/mcma-core");
const { ContextVariableProvider, EnvironmentVariableProvider } = require("./lib/context-variable-provider");
const { Logger, ConsoleLoggerProvider } = require("./lib/logger");
const Utils = require("./lib/utils");

module.exports = {
    onResourceCreate,
    onResourceUpsert,
    McmaObject,
    McmaTracker,
    Resource,
    Service,
    ResourceEndpoint,
    BMContent,
    BMEssence,
    DescriptiveMetadata,
    TechnicalMetadata,
    JobProfile,
    Locator,
    JobStatus,
    JobBase,
    JobProcess,
    JobAssignment,
    Job,
    JobParameter,
    JobParameterBag,
    AIJob,
    AmeJob,
    CaptureJob,
    QAJob,
    TransferJob,
    TransformJob,
    WorkflowJob,
    Notification,
    NotificationEndpoint,
    Exception,
    Logger,
    ConsoleLoggerProvider,
    ContextVariableProvider,
    EnvironmentVariableProvider,
    Utils
};
