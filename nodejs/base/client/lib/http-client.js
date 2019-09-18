//"use strict";
const { Exception } = require("@mcma/core");

const axios = require("axios");

async function request(config, authenticator) {
    if (!config) {
        throw new Exception("HttpClient: Missing configuration for making HTTP request");
    }

    if (config.method === undefined) {
        config.method = "GET";
    }

    if (config.baseURL) {
        if (!config.url) {
            config.url = config.baseURL;
        } else if (config.url.indexOf("http://") !== 0 && config.url.indexOf("https://") !== 0) {
            config.url = config.baseURL + config.url;
        } else if (!config.url.startsWith(config.baseURL)) {
            throw new Exception("HttpClient: Making " + config.method + " request to URL '" + config.url + "' which does not match baseURL '" + config.baseURL + "'");
        }
    }

    if (!config.url) {
        throw new Exception("HttpClient: Missing url in request config");
    }

    if (authenticator) {
        // if an authenticator was provided, ensure that it"s valid
        if (typeof authenticator.sign !== "function") {
            throw new Exception("HttpClient: Provided authenticator does not define the required sign() function.");
        }

        authenticator.sign(config);
    }

    // send request using axios
    try {
        return await axios(config);
    } catch (error) {
        throw new Exception("HttpClient: " + config.method + " request to " + config.url + " failed!", error, {
            config,
            response: error.response.data
        });
    }
};

class HttpClient {
    constructor(authenticator) {
        if (authenticator) {
            if (typeof authenticator.sign !== "function") {
                throw new Exception("HttpClient: Provided authenticator does not define the required sign() function.");
            }
            this.authenticator = authenticator;
        }

        this.get = async (url, config) => {
            config = config || {};
            config.url = url;
            config.method = "GET";
            return await request(config, this.authenticator);
        };

        this.post = async (url, data, config) => {
            config = config || {};
            config.url = url;
            config.method = "POST";
            config.data = data;
            return await request(config, this.authenticator);
        };

        this.put = async (url, data, config) => {
            config = config || {};
            config.url = url;
            config.method = "PUT";
            config.data = data;
            return await request(config, this.authenticator);
        };

        this.patch = async (url, data, config) => {
            config = config || {};
            config.url = url;
            config.method = "PATCH";
            config.data = data;
            return await request(config, this.authenticator);
        };

        this.delete = async (url, config) => {
            config = config || {};
            config.url = url;
            config.method = "DELETE";
            return await request(config, this.authenticator);
        };
    }
}

module.exports = {
    HttpClient
};
