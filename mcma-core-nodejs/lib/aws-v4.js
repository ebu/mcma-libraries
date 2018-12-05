const CryptoJS = require('crypto-js');
const url = require('url');

const AWS_SHA_256 = 'AWS4-HMAC-SHA256';
const AWS4_REQUEST = 'aws4_request';
const AWS4 = 'AWS4';
const X_AMZ_DATE = 'x-amz-date';
const X_AMZ_SECURITY_TOKEN = 'x-amz-security-token';
const HOST = 'host';
const AUTHORIZATION = 'Authorization';

function hash(value) {
    return CryptoJS.SHA256(value);
}

function hexEncode(value) {
    return value.toString(CryptoJS.enc.Hex);
}

function hmac(secret, value) {
    return CryptoJS.HmacSHA256(value, secret, { asBytes: true });
}

function buildCanonicalRequest(request, requestUrl) {
    return request.method + '\n' +
        buildCanonicalUri(requestUrl.pathname) + '\n' +
        buildCanonicalQueryString(requestUrl.query) + '\n' +
        buildCanonicalHeaders(request.headers) + '\n' +
        buildCanonicalSignedHeaders(request.headers) + '\n' +
        hexEncode(hash(typeof request.data === 'string' ? request.data : JSON.stringify(request.data)));
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

function buildAuthorizationHeader(accessKey, credentialScope, headers, signature) {
    return AWS_SHA_256 + ' Credential=' + accessKey + '/' + credentialScope + ', SignedHeaders=' + buildCanonicalSignedHeaders(headers) + ', Signature=' + signature;
}

function signRequest(request, credentials) {
    if (!credentials) {
        return;
    }

    // check for alternate names for access key & secret key 
    credentials.accessKey = credentials.accessKey || credentials.accessKeyId;
    credentials.secretKey = credentials.secretKey || credentials.secretAccessKey;

    // ensure access key and secret key is set
    if (!credentials.accessKey || !credentials.secretKey) {
        return;
    }

    credentials.serviceName = credentials.serviceName || 'execute-api';

    // capture request datetime
    const datetime = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[:\-]|\.\d{3}/g, '');
    request.headers[X_AMZ_DATE] = datetime;

    const requestUrl = url.parse(request.url, true);

    // add host header if missing
    if (!request.headers[HOST]) {
        request.headers[HOST] = requestUrl.host;
    }

    // build signature
    const canonicalRequest = buildCanonicalRequest(request, requestUrl);
    const hashedCanonicalRequest = hashCanonicalRequest(canonicalRequest);
    const credentialScope = buildCredentialScope(datetime, credentials.region, credentials.serviceName);
    const stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
    const signingKey = calculateSigningKey(credentials.secretKey, datetime, credentials.region, credentials.serviceName);
    const signature = calculateSignature(signingKey, stringToSign);

    // add authorization header with signature
    request.headers[AUTHORIZATION] = buildAuthorizationHeader(credentials.accessKey, credentialScope, request.headers, signature);

    // add security token (for temporary credentials)
    if (credentials.sessionToken) {
        request.headers[X_AMZ_SECURITY_TOKEN] = credentials.sessionToken;
    }

    // need to remove the host header if we're in the browser as it's protected and cannot be set
    delete request.headers[HOST];
}

class AwsV4Authenticator {
    constructor(credentials) {
        this.sign = (request) => {
            signRequest(request, credentials);
        };
    }
}

module.exports = AwsV4Authenticator;