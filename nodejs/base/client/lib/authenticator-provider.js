class AuthenticatorProvider {
    constructor(getAuthenticator) {
        this.getAuthenticator = getAuthenticator;
    }
}

module.exports = {
    AuthenticatorProvider
};