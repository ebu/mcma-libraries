const { Exception } = require("@mcma/core");
const { AuthProvider } = require("./auth-provider");

class AccessTokenAuthenticator {
    constructor(tokenOrProvider, authContext) {
        // check that the token/provider is valid
        if (!tokenOrProvider) {
            throw new Exception("Must provide an access token or access token provider.");
        }
        if (!tokenOrProvider.accessToken && !tokenOrProvider.getAccessToken) {
            throw new Exception("Invalid access token or access token provider. Object must define 'accessToken' or 'getAccessToken'.");
        }

        // set initial values from token/provider (may be undefined)
        let accessToken = tokenOrProvider.accessToken;
        let expiresOn = tokenOrProvider.expiresOn;

        this.sign = async (config) => {
            // check if the access token is expired
            if (accessToken && expiresOn &&
                (typeof expiresOn === "number" && Date.now() >= expiresOn) || (expiresOn instanceof Date && Date.now() >= expiresOn.getTime())) {
                accessToken = null;
            }

            // get the access token, if necessary
            if (!accessToken && tokenOrProvider.getAccessToken) {
                accessToken = await tokenOrProvider.getAccessToken(authContext);
            }

            // if we still don't have an access token at this point, we cannot proceed
            if (accessToken) {
                if (!config.headers) {
                    config.headers = {};
                }
                config.headers["Authorization"] = `Bearer ${accessToken.accessToken}`; 
            }
        };
    }
}

AuthProvider.prototype.addAccessTokenAuth = function addAccessTokenAuth(tokenOrProvider, authType) {
    authType = authType || "AccessToken";
    return this.add(authType, authContext => new AccessTokenAuthenticator(tokenOrProvider, authContext));
};

module.exports = {
    AccessTokenAuthenticator
};