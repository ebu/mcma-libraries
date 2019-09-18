class AuthProvider {
    constructor() {
        const registeredAuthTypes = {};

        this.add = (authType, authenticatorFactory) => {
            if (Object.keys(registeredAuthTypes).find(k => k.toLowerCase() === authType)) {
                throw new Error("Auth type '" + authType + "' has already been registered.");
            }
            if (typeof authenticatorFactory !== "function") {
                throw new Error("authenticatorFactory must be a function.");
            }

            registeredAuthTypes[authType] = authenticatorFactory;

            return this;
        };

        this.get = (authType, authContext) => {
            authType = Object.keys(registeredAuthTypes).find(k => k.toLowerCase() === (authType || "").toLowerCase());

            return authType && registeredAuthTypes[authType] && registeredAuthTypes[authType](authContext);
        };
    }
}

module.exports = {
    AuthProvider
};
