const MCMA_CORE = require("../index");
const axios = require("axios");

const creds = require("../aws-credentials.json");
const url = ""

describe("The AWS V4 Presigned Url Generator", () => {

    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("generates a usable presigned url to make a GET request", async () => {
        const presignedUrlGenerator = new MCMA_CORE.AwsV4PresignedUrlGenerator(creds);

        const presignedUrl = presignedUrlGenerator.generatePresignedUrl("GET", url, 7200);

        try {
            let response = await axios.get(presignedUrl);
        } catch (error) {
            console.log(error.message);
            if (error.response && error.response.data) {
                console.log(error.response.data.message);
            }
            fail();
        }
    });

    it("generates a usable presigned url to make a POST request with UNSIGNED PAYLOAD", async () => {
        const presignedUrlGenerator = new MCMA_CORE.AwsV4PresignedUrlGenerator(creds);

        const presignedUrl = presignedUrlGenerator.generatePresignedUrl("POST", url, 7200);

        const headers = { "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD" }

        try {
            let response = await axios.post(presignedUrl, {}, { headers });
        } catch (error) {
            console.log(error.message);
            if (error.response && error.response.data) {
                console.log(error.response.data.message);
            }
            fail();
        }
    });

})

describe("The MCMA_CORE.Exception class can ", () => {

    it("print a stack trace", async () => {
        
        let test1 = new MCMA_CORE.Exception("test1");

        let test2 = new MCMA_CORE.Exception("test2", test1);

        let test3 = new MCMA_CORE.Exception(test2, { hello: "World"});

        console.log(test3.toString());
    });
})