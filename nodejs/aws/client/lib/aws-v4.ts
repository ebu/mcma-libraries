import * as CryptoJS from "crypto-js";
import { HttpRequestConfig } from "@mcma/client";
import { McmaException } from "@mcma/core";

const AWS_SHA_256 = "AWS4-HMAC-SHA256";
const AWS4_REQUEST = "aws4_request";
const AWS4 = "AWS4";
const X_AMZ_DATE = "x-amz-date";
const X_AMZ_SECURITY_TOKEN = "x-amz-security-token";
const HOST = "host";
const AUTHORIZATION = "Authorization";

const X_AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
const X_AMZ_SECURITY_TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
const X_AMZ_ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
const X_AMZ_CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
const X_AMZ_SIGNEDHEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
const X_AMZ_SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
const X_AMZ_EXPIRES_QUERY_PARAM = "X-Amz-Expires";

function hash(value: string) {
    return CryptoJS.SHA256(value);
}

function hexEncode(value: CryptoJS.WordArray) {
    return value.toString(CryptoJS.enc.Hex);
}

function hmac(secret: string | CryptoJS.WordArray, value: string) {
    return CryptoJS.HmacSHA256(value, secret, { asBytes: true });
}

function buildCanonicalRequest(method: string, pathname: string, queryParams: { [key: string]: string }, headers: { [key: string]: string }, data: any) {
    return method + "\n" +
        buildCanonicalUri(pathname) + "\n" +
        buildCanonicalQueryString(queryParams) + "\n" +
        buildCanonicalHeaders(headers) + "\n" +
        buildCanonicalSignedHeaders(headers) + "\n" +
        hexEncode(hash(typeof data === "string" ? data : JSON.stringify(data)));
}

function hashCanonicalRequest(request: string) {
    return hexEncode(hash(request));
}

function buildCanonicalUri(uri: string) {
    return encodeURI(uri);
}

function buildCanonicalQueryString(queryParams: { [key: string]: string }) {
    if (Object.keys(queryParams ?? {}).length < 1) {
        return "";
    }

    const sortedQueryParams = [];
    for (const property of Object.keys(queryParams)) {
        sortedQueryParams.push(property);
    }
    sortedQueryParams.sort();

    let canonicalQueryString = "";
    for (let i = 0; i < sortedQueryParams.length; i++) {
        canonicalQueryString += sortedQueryParams[i] + "=" + fixedEncodeURIComponent(queryParams[sortedQueryParams[i]]) + "&";
    }
    return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
}

function fixedEncodeURIComponent(str: string) {
    return encodeURIComponent(str).replace(/[!"()*]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
}

function buildCanonicalHeaders(headers: { [key: string]: string }) {
    let canonicalHeaders = "";
    const sortedKeys: string[] = [];
    for (const property of Object.keys(headers)) {
        sortedKeys.push(property);
    }
    sortedKeys.sort();

    for (let i = 0; i < sortedKeys.length; i++) {
        canonicalHeaders += sortedKeys[i].toLowerCase() + ":" + headers[sortedKeys[i]] + "\n";
    }
    return canonicalHeaders;
}

function buildCanonicalSignedHeaders(headers: { [key: string]: string }): string {
    const sortedKeys = [];
    for (const property of Object.keys(headers)) {
        sortedKeys.push(property.toLowerCase());
    }
    sortedKeys.sort();

    return sortedKeys.join(";");
}

function buildStringToSign(datetime: string, credentialScope: string, hashedCanonicalRequest: string) {
    return AWS_SHA_256 + "\n" +
        datetime + "\n" +
        credentialScope + "\n" +
        hashedCanonicalRequest;
}

function buildCredentialScope(datetime: string, region: string, service: string) {
    return datetime.substr(0, 8) + "/" + region + "/" + service + "/" + AWS4_REQUEST;
}

function calculateSigningKey(secretKey: string, datetime: string, region: string, service: string): CryptoJS.WordArray {
    return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substr(0, 8)), region), service), AWS4_REQUEST);
}

function calculateSignature(key: CryptoJS.WordArray, stringToSign: string) {
    return hexEncode(hmac(key, stringToSign));
}

function buildAuthorizationHeader(signature: string, credentialScope: string, signedHeaders: string) {
    return AWS_SHA_256 + " Credential=" + credentialScope + ", SignedHeaders=" + signedHeaders + ", Signature=" + signature;
}

function generateSignature(request: HttpRequestConfig, credentials: ConformedCredentials, datetime: string, credentialScope: string): string {
    if (!credentials) {
        return "";
    }

    // parse the url and create a params object from the query string, if any
    const requestUrl = new URL(request.url);

    let requestQueryParams: { [key: string]: string } = {};
    for (let entry of requestUrl.searchParams.entries()) {
        requestQueryParams[entry[0]] = entry[1];
    }

    // build full set of query params, both from the url and from the params property of the request, into a single object
    const queryParams: { [key: string]: string } = Object.assign({}, requestQueryParams, request.params ?? {});

    // build signature
    const canonicalRequest = buildCanonicalRequest(request.method, requestUrl.pathname, queryParams, request.headers, request.data);
    const hashedCanonicalRequest = hashCanonicalRequest(canonicalRequest);
    const stringToSign = buildStringToSign(datetime, credentialScope, hashedCanonicalRequest);
    const signingKey = calculateSigningKey(credentials.secretKey, datetime, credentials.region, credentials.serviceName);

    return calculateSignature(signingKey, stringToSign);
}

function getAwsDate(): string {
    return new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:\-]|\.\d{3}/g, "");
}

type ConformedCredentials = { accessKey?: string, secretKey?: string, serviceName?: string, region?: string, sessionToken?: string };
type Credentials = ConformedCredentials & { accessKeyId?: string, secretAccessKey?: string };

function conformCredentials(credentials: Credentials): ConformedCredentials {
    // check for alternate names for access key & secret key 
    credentials.accessKey = credentials.accessKey ?? credentials.accessKeyId;
    credentials.secretKey = credentials.secretKey ?? credentials.secretAccessKey;

    // ensure access key and secret key is set
    if (!credentials.accessKey || !credentials.secretKey) {
        throw new McmaException("Failed to conform AWS credentials");
    }

    // if no service name was provided, we"ll assume this is an API Gateway request
    credentials.serviceName = credentials.serviceName ?? "execute-api";

    return credentials;
}

export class AwsV4Authenticator {
    private readonly credentials: ConformedCredentials;

    constructor(credentials: Credentials) {
        this.credentials = conformCredentials(credentials);
    }

    async sign(request: HttpRequestConfig): Promise<void> {
        const requestUrlParsed = new URL(request.url);

        // create headers object in case missing
        request.headers = request.headers ?? {};

        // capture request datetime
        const datetime = getAwsDate();
        request.headers[X_AMZ_DATE] = datetime;

        // add host header if missing
        if (!request.headers[HOST]) {
            request.headers[HOST] = requestUrlParsed.host;
        }

        const credentialScope = buildCredentialScope(datetime, this.credentials.region, this.credentials.serviceName);
        const signedHeaders = buildCanonicalSignedHeaders(request.headers);

        const signature = generateSignature(request, this.credentials, datetime, credentialScope);

        // add authorization header with signature
        request.headers[AUTHORIZATION] = buildAuthorizationHeader(signature, this.credentials.accessKey + "/" + credentialScope, signedHeaders);

        // add security token (for temporary credentials)
        if (this.credentials.sessionToken) {
            request.headers[X_AMZ_SECURITY_TOKEN] = this.credentials.sessionToken;
        }

        // need to remove the host header if we"re in the browser as it"s protected and cannot be set
        delete request.headers[HOST];
    };
}

export class AwsV4PresignedUrlGenerator {
    private readonly credentials: ConformedCredentials;

    constructor(credentials: Credentials) {
        this.credentials = conformCredentials(credentials);
    }
    
    generatePresignedUrl = (method: string, requestUrl: string, expires = 300) => {
        // parse the url we want to sign so we can work with the query string
        const requestUrlParsed = new URL(requestUrl);

        // gather inputs for generating the signature
        const headers: { [key: string]: string } = {};
        headers[HOST] = requestUrlParsed.host;

        const datetime = getAwsDate();
        const credentialScope = buildCredentialScope(datetime, this.credentials.region, this.credentials.serviceName);
        const signedHeaders = buildCanonicalSignedHeaders(headers);

        // add parameters for signing
        requestUrlParsed.searchParams.set(X_AMZ_ALGORITHM_QUERY_PARAM, AWS_SHA_256);
        requestUrlParsed.searchParams.set(X_AMZ_CREDENTIAL_QUERY_PARAM, this.credentials.accessKey + "/" + credentialScope);
        requestUrlParsed.searchParams.set(X_AMZ_DATE_QUERY_PARAM, datetime);
        requestUrlParsed.searchParams.set(X_AMZ_EXPIRES_QUERY_PARAM, expires.toString());
        requestUrlParsed.searchParams.set(X_AMZ_SIGNEDHEADERS_QUERY_PARAM, signedHeaders);

        // not sure if this should be added before or after we generate the signature...
        if (this.credentials.sessionToken) {
            requestUrlParsed.searchParams.set(X_AMZ_SECURITY_TOKEN_QUERY_PARAM, this.credentials.sessionToken);
        }

        let params: { [key: string]: string } = {};
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
        requestUrlParsed.searchParams.set(X_AMZ_SIGNATURE_QUERY_PARAM, generateSignature(mockRequest, this.credentials, datetime, credentialScope));

        return requestUrlParsed.toString();
    };
}
