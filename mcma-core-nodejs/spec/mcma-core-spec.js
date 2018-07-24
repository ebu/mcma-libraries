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

        service = await resourceManager.update(service);
        console.log(service);

        for (let i = 0; i < services.length; i++) {
            await resourceManager.delete(services[i]);
        }

        services = await resourceManager.get("Service");
        console.log(JSON.stringify(services, null, 2));
    });

});
