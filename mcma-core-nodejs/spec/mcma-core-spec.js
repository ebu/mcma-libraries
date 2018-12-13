const MCMA_CORE = require("../index");
const creds = require("./aws-credentials.json");

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

        service = await resourceManager.update(service);
        console.log(service);

        for (let i = 0; i < services.length; i++) {
            await resourceManager.delete(services[i]);
        }

        services = await resourceManager.get("Service");
        console.log(JSON.stringify(services, null, 2));
    });

});

describe("The AWS V4 Presigned Url Generator", () => {

    beforeEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
    
    it("generates a usable presigned url for the service registry", async (done) => {
        const presignedUrlGenerator = new MCMA_CORE.AwsV4PresignedUrlGenerator(creds);

        const presignedUrl = presignedUrlGenerator.generatePresignedUrl('GET', 'https://d30k22ahlf.execute-api.us-east-1.amazonaws.com/dev/services', 7200);
        console.log(presignedUrl);
        let resp;
        try {
            resp = await MCMA_CORE.HTTP.get(presignedUrl);
            console.log('success', resp);
        } catch (e) {
            console.error('failed', e);
            throw e;
        }

        done();
    });
});
