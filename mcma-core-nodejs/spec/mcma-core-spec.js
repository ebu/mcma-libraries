const MCMA_CORE = require("../index");
const axios = require("axios");

const creds = {
    "accessKey": "ASIA4TMTELNVNWLDKN4S",
    "secretKey": "C9fi98MPxmByRpdGbHoCWXXENbpzEPrN+TKqwU2Q",
    "sessionToken": "FQoGGXIvYXdzELz//////////wEaDF5RQgn/mkCTODjVjiKSAhCHA65WOFZaHBGY09cnOQV9J+AKWEPlzEFuq26ljF5QYupecHHOImJ/Xr/cN9SLAbDkvwwgE8mH1+0NQtbpMc8CVcWjprlnA52FOze/03KPfKqD4SPYfSA3/xBpvPZpTrlxKTF02rrcTsgjw1JKG+cGZnoQDoqvuc1Y7Ywwnhi76JLRCNOYut90UwdWB3aqFM7957S3Rt2OcnljOGJ0ZtEbgvKQukbxGNSfwL8qmD/O+sRPM30SBJsV6W6jD2xLMmzO5SNci3GwLBaBMTsdaKI2tukLfMFUm0UxqLhL5iOexBofsTs3GOEPt6ay2ZtlFhIUHCkLZ/juWYwxD1iazFsYyQauBSrUYZSA81/OWZAT5T4olPS84QU=",
    "region": "eu-west-1",
    "serviceName": "execute-api"
}

const url = "https://0iwc4dxaqg.execute-api.eu-west-1.amazonaws.com/work/notifications?taskToken=AAAAKgAAAAIAAAAAAAAAAWt1RJ2geGcamL5mZ1gJBaYQUzpZD9aMjoC6aVIaZ9V2q6SIUqC7%2BHuvYdTDiXdMcbezcHWnh8NFkleaO254JqMVQdas6U5dQ2zNQO1aLsj63J61rFAQm3Ab5GWnysUWcHLes7IQ0X%2BKM%2FwW0MlgipWJuw8Fhub0GDNap6ECiYqUlOQpF0lMxVEkFnRn08mFjNRpTFlFKJA%2FtCUQ7O%2FYjwanslcxa50Pj4DdY%2FA958OjReJvjKrw4qaoBVt%2BB2zWq%2BklwKP%2BSt0nDFhXlzZ4AfLFFdrRF%2FUPZYZXte8PLQatTnJoduJ7m7ljPYvx9vyHythwZxDNqi5q9LLs%2BErt3TET6dTZg%2FIawbiVjvChfKijGWSRHPiNAZDb%2BC1lN1edM82WXD50E%2FBjhL%2B9PBmPFwvFS5DMCDTKA9ybjjOfJhQOAKks46nIsmtCAi6oljB%2BWO8K993cnOdiLbQs7vFY1aEbMFfpfPYP5fMtvnKftnSyX7ASR6bTQhTHStJ8GUUlunCiRThixoiLBPlHqRZlTWVon9BMRK1kbjrLJBrhq9zW7anTQRh96%2BQiiSSnkuX3yMv9uX4UWliE9njOH46GoQBdaISItdLsGaSE%2FRMceRp6vcBsMq9bnTZdnyVTyeZJMg%3D%3D"

describe("The AWS V4 Presigned Url Generator", () => {

    beforeEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    it("generates a usable presigned url to make a GET request", async () => {
        const presignedUrlGenerator = new MCMA_CORE.AwsV4PresignedUrlGenerator(creds);

        const presignedUrl = presignedUrlGenerator.generatePresignedUrl('GET', url, 7200);

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

    it("generates a usable presigned url to make a POST request with UNSIGNED PAYLOAD", async () => {
        const presignedUrlGenerator = new MCMA_CORE.AwsV4PresignedUrlGenerator(creds);

        const presignedUrl = presignedUrlGenerator.generatePresignedUrl('POST', url, 7200);

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

