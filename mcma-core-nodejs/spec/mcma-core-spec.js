const MCMA_CORE = require("../lib/mcma-core")

const SERVICE_REGISTRY_BASE_URL = "";
const SERVICE_REGISTRY_SERVICES_URL = SERVICE_REGISTRY_BASE_URL + "/services";

describe("The Resource Manager", () => {

    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
    
    it("allows retrieving, setting and deleting resources", async () => {
        let resourceManager = new MCMA_CORE.ResourceManager(SERVICE_REGISTRY_SERVICES_URL);

        let service = new MCMA_CORE.Service("Service Registry", [
            new MCMA_CORE.ServiceResource("Service", SERVICE_REGISTRY_BASE_URL + "/services"),
            new MCMA_CORE.ServiceResource("JobProfile", SERVICE_REGISTRY_BASE_URL + "/job-profiles")
        ]);

        let services = await resourceManager.get("Service");
        console.log(JSON.stringify(services, null, 2));

        service = await resourceManager.create(service);        
        console.log(service);

        services = await resourceManager.get("Service");
        console.log(JSON.stringify(services, null, 2));

        for (let i = 0; i < services.length; i++) {
            await resourceManager.delete(services[i]);
        }

        services = await resourceManager.get("Service");
        console.log(JSON.stringify(services, null, 2));
    });

/*    it("allows creating a Job Profile", (callback) => {
        var jobProfile = new core.JobProfile(
            "ExtractThumbnail",
            [
                new core.JobParameter("mcma:inputFile", "mcma:Locator"),
                new core.JobParameter("mcma:outputLocation", "mcma:Locator")
            ],
            [
                new core.JobParameter("mcma:outputFile", "mcma:Locator")
            ],
            [
                new core.JobParameter("ebucore:width"),
                new core.JobParameter("ebucore:height")
            ]
        );

        core.compact(jobProfile, {}, (err, output) => {
            expect(err).toBeNull();

            expect(output["@type"]).toBe("http://www.ebu.ch/mcma#JobProfile");
            expect(output["http://www.w3.org/2000/01/rdf-schema#label"]).toBe("ExtractThumbnail");

            expect(output["http://www.ebu.ch/mcma#hasInputParameter"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"].length).toBe(2);
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameter");
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]["http://www.ebu.ch/mcma#jobParameterType"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]["http://www.ebu.ch/mcma#jobParameterType"]["@id"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]["http://www.ebu.ch/mcma#jobProperty"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][0]["http://www.ebu.ch/mcma#jobProperty"]["@id"]).toBe("http://www.ebu.ch/mcma#inputFile");
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameter");
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]["http://www.ebu.ch/mcma#jobParameterType"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]["http://www.ebu.ch/mcma#jobParameterType"]["@id"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]["http://www.ebu.ch/mcma#jobProperty"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasInputParameter"][1]["http://www.ebu.ch/mcma#jobProperty"]["@id"]).toBe("http://www.ebu.ch/mcma#outputLocation");

            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"].length).toBe(2);
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][0]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][0]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameter");
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][0]["http://www.ebu.ch/mcma#jobProperty"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][0]["http://www.ebu.ch/mcma#jobProperty"]["@id"]).toBe("http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#width");
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][1]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][1]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameter");
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][1]["http://www.ebu.ch/mcma#jobProperty"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOptionalInputParameter"][1]["http://www.ebu.ch/mcma#jobProperty"]["@id"]).toBe("http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#height");

            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameter");
            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]["http://www.ebu.ch/mcma#jobParameterType"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]["http://www.ebu.ch/mcma#jobParameterType"]["@id"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]["http://www.ebu.ch/mcma#jobProperty"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasOutputParameter"]["http://www.ebu.ch/mcma#jobProperty"]["@id"]).toBe("http://www.ebu.ch/mcma#outputFile");

            callback(err);
        });
    });

    it("allows creating a Service", (callback) => {
        var service = new core.Service(
            "FFmpeg TransformService",
            [
                new core.ServiceResource("mcma:JobAssignment", "http://transformServiceUrl/JobAssignment")
            ],
            "mcma:TransformJob",
            [
                "http://urlToExtractThumbnailJobProfile/",
                "http://urlToCreateProxyJobProfile/"
            ],
            [
                new core.Locator({
                    "awsS3Bucket": "private-repo.mcma.ebu.ch"
                })
            ],
            [
                new core.Locator({
                    "awsS3Bucket": "private-repo.mcma.ebu.ch"
                })
            ]
        );

        core.compact(service, {}, (err, output) => {
            expect(err).toBeNull();

            expect(output["@type"]).toBe("http://www.ebu.ch/mcma#Service");
            expect(output["http://www.w3.org/2000/01/rdf-schema#label"]).toBe("FFmpeg TransformService");

            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["@type"]).toBe("http://www.ebu.ch/mcma#ServiceResource");
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["http://www.ebu.ch/mcma#resourceType"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["http://www.ebu.ch/mcma#resourceType"]["@id"]).toBe("http://www.ebu.ch/mcma#JobAssignment");
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["http://www.ebu.ch/mcma#httpEndpoint"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["http://www.ebu.ch/mcma#httpEndpoint"]["@type"]).toBe("http://www.w3.org/2001/XMLSchema#anyURI");
            expect(output["http://www.ebu.ch/mcma#hasServiceResource"]["http://www.ebu.ch/mcma#httpEndpoint"]["@value"]).toBe("http://transformServiceUrl/JobAssignment");

            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"].length).toBe(2);
            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"][0]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"][0]["@id"]).toBe("http://urlToExtractThumbnailJobProfile/");
            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"][1]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#acceptsJobProfile"][1]["@id"]).toBe("http://urlToCreateProxyJobProfile/");

            expect(output["http://www.ebu.ch/mcma#acceptsJobType"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#acceptsJobType"]["@id"]).toBe("http://www.ebu.ch/mcma#TransformJob");

            expect(output["http://www.ebu.ch/mcma#hasJobInputLocation"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobInputLocation"]["@type"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasJobInputLocation"]["http://www.ebu.ch/mcma#amazonWebServicesS3Bucket"]).toBe("private-repo.mcma.ebu.ch");

            expect(output["http://www.ebu.ch/mcma#hasJobOutputLocation"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobOutputLocation"]["@type"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasJobOutputLocation"]["http://www.ebu.ch/mcma#amazonWebServicesS3Bucket"]).toBe("private-repo.mcma.ebu.ch");

            callback(err);
        });
    });

    it("allows creating a Transform Job", (callback) => {
        var transformJob = new core.TransformJob(
            "http://urlToExtractThumbnailJobProfile/",
            new core.JobParameterBag({
                "mcma:inputFile": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3Key: "media-file.mp4"
                }),
                "mcma:outputLocation": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3KeyPrefix: "thumbnails/"
                })
            }),
            new core.AsyncEndpoint("http://urlForJobSuccess", "http://urlForJobFailed")
        );

        core.compact(transformJob, {}, (err, output) => {
            expect(err).toBeNull();

            expect(output["@type"]).toBe("http://www.ebu.ch/mcma#TransformJob");

            expect(output["http://www.ebu.ch/mcma#hasJobProfile"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobProfile"]["@id"]).toBe("http://urlToExtractThumbnailJobProfile/");

            expect(output["http://www.ebu.ch/mcma#hasJobInput"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["@type"]).toBe("http://www.ebu.ch/mcma#JobParameterBag");
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#inputFile"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#inputFile"]["@type"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#inputFile"]["http://www.ebu.ch/mcma#amazonWebServicesS3Bucket"]).toBe("private-repo.mcma.ebu.ch");
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#inputFile"]["http://www.ebu.ch/mcma#amazonWebServicesS3Key"]).toBe("media-file.mp4");

            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#outputLocation"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#outputLocation"]["@type"]).toBe("http://www.ebu.ch/mcma#Locator");
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#outputLocation"]["http://www.ebu.ch/mcma#amazonWebServicesS3Bucket"]).toBe("private-repo.mcma.ebu.ch");
            expect(output["http://www.ebu.ch/mcma#hasJobInput"]["http://www.ebu.ch/mcma#outputLocation"]["http://www.ebu.ch/mcma#amazonWebServicesS3KeyPrefix"]).toBe("thumbnails/");

            expect(output["http://www.ebu.ch/mcma#hasJobStatus"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobStatus"]["@type"]).toBe("http://www.ebu.ch/mcma#JobStatus");
            expect(output["http://www.ebu.ch/mcma#hasJobStatus"]["@value"]).toBe("NEW");

            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["@type"]).toBe("http://www.ebu.ch/mcma#AsyncEndpoint");
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointFailure"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointFailure"]["@type"]).toBe("http://www.w3.org/2001/XMLSchema#anyURI");
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointFailure"]["@value"]).toBe("http://urlForJobFailed");
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointSuccess"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointSuccess"]["@type"]).toBe("http://www.w3.org/2001/XMLSchema#anyURI");
            expect(output["http://www.ebu.ch/mcma#hasAsyncEndpoint"]["http://www.ebu.ch/mcma#asyncEndpointSuccess"]["@value"]).toBe("http://urlForJobSuccess");

            callback(err);
        });
    });

    it("allows creating a Job Process", (callback) => {
        var jobProcess = new core.JobProcess("http://urlToTransformJob");

        core.compact(jobProcess, {}, (err, output) => {
            expect(err).toBeNull();

            expect(output["@type"]).toBe("http://www.ebu.ch/mcma#JobProcess");

            expect(output["http://www.ebu.ch/mcma#hasJob"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJob"]["@id"]).toBe("http://urlToTransformJob");

            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]["@type"]).toBe("http://www.ebu.ch/mcma#JobProcessStatus");
            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]["@value"]).toBe("NEW");

            callback(err);
        });
    });

    it("allows creating a Job Assignment", (callback) => {
        var jobAssignment = new core.JobAssignment("http://urlToJobProcess");

        core.compact(jobAssignment, {}, (err, output) => {
            expect(err).toBeNull();

            expect(output["@type"]).toBe("http://www.ebu.ch/mcma#JobAssignment");

            expect(output["http://www.ebu.ch/mcma#hasJobProcess"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobProcess"]["@id"]).toBe("http://urlToJobProcess");

            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]).toBeDefined();
            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]["@type"]).toBe("http://www.ebu.ch/mcma#JobProcessStatus");
            expect(output["http://www.ebu.ch/mcma#hasJobProcessStatus"]["@value"]).toBe("NEW");

            callback(err);
        });
    });

    it("allows validation of a Job", (callback) => {
        var transformJob = new core.TransformJob(
            new core.JobProfile(
                "ExtractThumbnail",
                [
                    new core.JobParameter("mcma:inputFile", "mcma:Locator"),
                    new core.JobParameter("mcma:outputLocation", "mcma:Locator")
                ],
                [
                    new core.JobParameter("mcma:outputFile", "mcma:Locator")
                ],
                [
                    new core.JobParameter("ebucore:width"),
                    new core.JobParameter("ebucore:height")
                ]
            ),
            new core.JobParameterBag({
                "mcma:inputFile": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3Key: "media-file.mp4"
                }),
                "mcma:outputLocation": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3KeyPrefix: "thumbnails/"
                })
            }),
            new core.AsyncEndpoint("http://urlForJobSuccess", "http://urlForJobFailed")
        );

        core.isValidJob(transformJob, (err) => {
            expect(err).toBeNull();

            callback(err);
        });
    });

    it("can determine if service can accept a Job", (callback) => {
        var service = new core.Service(
            "FFmpeg TransformService",
            [
                new core.ServiceResource("mcma:JobAssignment", "http://transformServiceUrl/JobAssignment")
            ],
            "mcma:TransformJob",
            [
                new core.JobProfile(
                    "ExtractThumbnail",
                    [
                        new core.JobParameter("mcma:inputFile", "mcma:Locator"),
                        new core.JobParameter("mcma:outputLocation", "mcma:Locator")
                    ],
                    [
                        new core.JobParameter("mcma:outputFile", "mcma:Locator")
                    ],
                    [
                        new core.JobParameter("ebucore:width"),
                        new core.JobParameter("ebucore:height")
                    ]
                )
            ],
            [
                new core.Locator({
                    "awsS3Bucket": "private-repo.mcma.ebu.ch"
                })
            ],
            [
                new core.Locator({
                    "awsS3Bucket": "private-repo.mcma.ebu.ch"
                })
            ]
        );

        var transformJob = new core.TransformJob(
            new core.JobProfile(
                "ExtractThumbnail",
                [
                    new core.JobParameter("mcma:inputFile", "mcma:Locator"),
                    new core.JobParameter("mcma:outputLocation", "mcma:Locator")
                ],
                [
                    new core.JobParameter("mcma:outputFile", "mcma:Locator")
                ],
                [
                    new core.JobParameter("ebucore:width"),
                    new core.JobParameter("ebucore:height")
                ]
            ),
            new core.JobParameterBag({
                "mcma:inputFile": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3Key: "media-file.mp4"
                }),
                "mcma:outputLocation": new core.Locator({
                    awsS3Bucket: "private-repo.mcma.ebu.ch",
                    awsS3KeyPrefix: "thumbnails/"
                })
            }),
            new core.AsyncEndpoint("http://urlForJobSuccess", "http://urlForJobFailed")
        );

        core.canServiceAcceptJob(service, transformJob, (err) => {
            expect(err).toBeNull();

            callback(err);
        });
    });*/
});
