const CryptoJS = require('crypto-js');
const WHATWG_URL = require('url');

if ("URL" in WHATWG_URL) {
    URL = WHATWG_URL.URL;
}

const AWS_SHA_256 = 'AWS4-HMAC-SHA256';
const AWS4_REQUEST = 'aws4_request';
const AWS4 = 'AWS4';
const X_AMZ_DATE = 'x-amz-date';
const X_AMZ_SECURITY_TOKEN = 'x-amz-security-token';
const HOST = 'host';
const AUTHORIZATION = 'Authorization';

const X_AMZ_DATE_QUERY_PARAM = 'X-Amz-Date';
const X_AMZ_SECURITY_TOKEN_QUERY_PARAM = 'X-Amz-Security-Token';
const X_AMZ_ALGORITHM_QUERY_PARAM = 'X-Amz-Algorithm';
const X_AMZ_CREDENTIAL_QUERY_PARAM = 'X-Amz-Credential';
const X_AMZ_SIGNEDHEADERS_QUERY_PARAM = 'X-Amz-SignedHeaders';
const X_AMZ_SIGNATURE_QUERY_PARAM = 'X-Amz-Signature';
const X_AMZ_EXPIRES_QUERY_PARAM = 'X-Amz-Expires';

function hash(value) {
    return CryptoJS.SHA256(value);
}

function hexEncode(value) {
    return value.toString(CryptoJS.enc.Hex);
}

function hmac(secret, value) {
    return CryptoJS.HmacSHA256(value, secret, { asBytes: true });
}

function buildCanonicalRequest(method, pathname, queryParams, headers, data) {
    return method + '\n' +
        buildCanonicalUri(pathname) + '\n' +
        buildCanonicalQueryString(queryParams) + '\n' +
        buildCanonicalHeaders(headers) + '\n' +
        buildCanonicalSignedHeaders(headers) + '\n' +
        hexEncode(hash(typeof data === 'string' ? data : JSON.stringify(data)));
}

function hashCanonicalRequest(request) {
    return hexEncode(hash(request));
}

function buildCanonicalUri(uri) {
    return encodeURI(uri);
}

function buildCanonicalQueryString(queryParams) {
    if (Object.keys(queryParams || {}).length < 1) {
        return '';
    }

    var sortedQueryParams = [];
    for (var property of Object.keys(queryParams)) {
        sortedQueryParams.push(property);
    }
    sortedQueryParams.sort();

    var canonicalQueryString = '';
    for (var i = 0; i < sortedQueryParams.length; i++) {
        canonicalQueryString += sortedQueryParams[i] + '=' + fixedEncodeURIComponent(queryParams[sortedQueryParams[i]]) + '&';
    }
    return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
}

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

function buildCanonicalHeaders(headers) {
    var canonicalHeaders = '';
    var sortedKeys = [];
    for (var property of Object.keys(headers)) {
        sortedKeys.push(property);
    }
    sortedKeys.sort();

    for (var i = 0; i < sortedKeys.length; i++) {
        canonicalHeaders += sortedKeys[i].toLowerCase() + ':' + headers[sortedKeys[i]] + '\n';
    }
    return canonicalHeaders;
}

function buildCanonicalSignedHeaders(headers) {
    var sortedKeys = [];
    for (var property of Object.keys(headers)) {
        sortedKeys.push(property.toLowerCase());
    }
    sortedKeys.sort();

    return sortedKeys.join(';');
}

function buildStringToSign(datetime, credentialScope, hashedCanonicalRequest) {
    return AWS_SHA_256 + '\n' +
        datetime + '\n' +
        credentialScope + '\n' +
        hashedCanonicalRequest;
}

function buildCredentialScope(datetime, region, service) {
    return datetime.substr(0, 8) + '/' + region + '/' + service + '/' + AWS4_REQUEST
}

function calculateSigningKey(secretKey, datetime, region, service) {
    return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substr(0, 8)), region), service), AWS4_REQUEST);
}

function calculateSignature(key, stringToSign) {
    return hexEncode(hmac(key, stringToSign));
}

function buildAuthorizationHeader(signature, credentialScope, signedHeaders) {
    return AWS_SHA_256 + ' Credential=' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
}

function generateSignature(request, credentials, datetime, credentialScope) {
    if (!credentials) {
        return;
    }

    // parse the url and create a params object from the query string, if any
    const requestUrl = new URL(request.url);

    let requestQueryParams = {}
    for (let entry of requestUrl.searchParams.entries()) {
        requestQueryParams[entry[0]] = entry[1];
    }

    // build full set of query params, both from the url and from the params property of the request, into a single object
    const queryParams = Object.assign({}, requestQueryParams, request.params || {});

    // build signature
    const canonicalRequest = buildCanonicalRequest(request.method, requestUrl.pathname, queryParams, request.headers, request.data);
    const hashedCanonicalRequest = hashCanonicalRequest(canonicalRequest);
    const stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
    const signingKey = calculateSigningKey(credentials.secretKey, datetime, credentials.region, credentials.serviceName);

    return calculateSignature(signingKey, stringToSign);
}

function getAwsDate() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:\-]|\.\d{3}/g, '');
}

function conformCredentials(credentials) {
    // check for alternate names for access key & secret key 
    credentials.accessKey = credentials.accessKey || credentials.accessKeyId;
    credentials.secretKey = credentials.secretKey || credentials.secretAccessKey;

    // ensure access key and secret key is set
    if (!credentials.accessKey || !credentials.secretKey) {
        return;
    }

    // if no service name was provided, we'll assume this is an API Gateway request
    credentials.serviceName = credentials.serviceName || 'execute-api';

    return credentials;
}

class AwsV4Authenticator {
    constructor(credentials) {
        credentials = conformCredentials(credentials);

        this.sign = (request) => {
            const requestUrlParsed = new URL(request.url);

            // create headers object in case missing
            request.headers = request.headers || {};

            // capture request datetime
            const datetime = getAwsDate();
            request.headers[X_AMZ_DATE] = datetime;

            // add host header if missing
            if (!request.headers[HOST]) {
                request.headers[HOST] = requestUrlParsed.host;
            }

            const credentialScope = buildCredentialScope(datetime, credentials.region, credentials.serviceName);
            const signedHeaders = buildCanonicalSignedHeaders(request.headers);

            const signature = generateSignature(request, credentials, datetime, credentialScope);

            // add authorization header with signature
            request.headers[AUTHORIZATION] = buildAuthorizationHeader(signature, credentials.accessKey + '/' + credentialScope, signedHeaders);

            // add security token (for temporary credentials)
            if (credentials.sessionToken) {
                request.headers[X_AMZ_SECURITY_TOKEN] = credentials.sessionToken;
            }

            // need to remove the host header if we're in the browser as it's protected and cannot be set
            delete request.headers[HOST];
        };
    }
}

class AwsV4PresignedUrlGenerator {
    constructor(credentials) {
        credentials = conformCredentials(credentials);

        this.generatePresignedUrl = (method, requestUrl, expires = 300) => {
            // parse the url we want to sign so we can work with the query string
            const requestUrlParsed = new URL(requestUrl);

            // gather inputs for generating the signature
            const headers = {}
            headers[HOST] = requestUrlParsed.host;

            const datetime = getAwsDate();
            const credentialScope = buildCredentialScope(datetime, credentials.region, credentials.serviceName);
            const signedHeaders = buildCanonicalSignedHeaders(headers);

            // add parameters for signing
            requestUrlParsed.searchParams.set(X_AMZ_ALGORITHM_QUERY_PARAM, AWS_SHA_256);
            requestUrlParsed.searchParams.set(X_AMZ_CREDENTIAL_QUERY_PARAM, credentials.accessKey + '/' + credentialScope);
            requestUrlParsed.searchParams.set(X_AMZ_DATE_QUERY_PARAM, datetime);
            requestUrlParsed.searchParams.set(X_AMZ_EXPIRES_QUERY_PARAM, expires);
            requestUrlParsed.searchParams.set(X_AMZ_SIGNEDHEADERS_QUERY_PARAM, signedHeaders);

            // not sure if this should be added before or after we generate the signature...
            if (credentials.sessionToken) {
                requestUrlParsed.searchParams.set(X_AMZ_SECURITY_TOKEN_QUERY_PARAM, credentials.sessionToken);
            }

            let params = {}
            for (let entry of requestUrlParsed.searchParams.entries()) {
                params[entry[0]] = entry[1];
            }

            // build a mock request to use to generat the signature
            const mockRequest = {
                method,
                url: requestUrl,
                params,
                headers
            };

            // add the signature to the existing query object
            requestUrlParsed.searchParams.set(X_AMZ_SIGNATURE_QUERY_PARAM, generateSignature(mockRequest, credentials, datetime, credentialScope));

            return requestUrlParsed.toString();
        };
    }
}

module.exports = {
    AwsV4Authenticator,
    AwsV4PresignedUrlGenerator
};