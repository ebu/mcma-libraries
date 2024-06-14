import * as CryptoJS from "crypto-js";
import { AwsCredentialIdentity, Provider } from "@aws-sdk/types";
import { fromEnv } from "@aws-sdk/credential-providers";
import { Method } from "axios";
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

function hexEncode(value: CryptoJS.lib.WordArray) {
    return value.toString(CryptoJS.enc.Hex);
}

function hmac(secret: string | CryptoJS.lib.WordArray, value: string) {
    return CryptoJS.HmacSHA256(value, secret);
}

function buildCanonicalRequest(method: string, pathname: string, queryParams: { [key: string]: string }, headers: { [key: string]: any }, data: any) {
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
    return canonicalQueryString.substring(0, canonicalQueryString.length - 1);
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

function buildCanonicalSignedHeaders(headers: { [key: string]: any }): string {
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
    return datetime.substring(0, 8) + "/" + region + "/" + service + "/" + AWS4_REQUEST;
}

function calculateSigningKey(secretKey: string, datetime: string, region: string, service: string): CryptoJS.lib.WordArray {
    return hmac(hmac(hmac(hmac(AWS4 + secretKey, datetime.substring(0, 8)), region), service), AWS4_REQUEST);
}

function calculateSignature(key: CryptoJS.lib.WordArray, stringToSign: string) {
    return hexEncode(hmac(key, stringToSign));
}

function buildAuthorizationHeader(signature: string, credentialScope: string, signedHeaders: string) {
    return AWS_SHA_256 + " Credential=" + credentialScope + ", SignedHeaders=" + signedHeaders + ", Signature=" + signature;
}

function generateSignature(request: HttpRequestConfig, credentials: AwsCredentialIdentity, region: string, serviceName: string, datetime: string, credentialScope: string): string {
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
    const signingKey = calculateSigningKey(credentials.secretAccessKey, datetime, region, serviceName);

    return calculateSignature(signingKey, stringToSign);
}

function getAwsDate(): string {
    return new Date().toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:\-]|\.\d{3}/g, "");
}

export class AwsV4Authenticator {
    private readonly credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
    private readonly region: string;
    private readonly serviceName: string;

    constructor(config?: { credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>, region?: string, serviceName?: string }) {
        this.credentials = config?.credentials ?? fromEnv();
        this.region = config?.region ?? process.env.AWS_REGION;
        this.serviceName = config?.serviceName ?? "execute-api";

        if (!this.region) {
            throw new McmaException("AwsV4Authenticator: AWS_REGION is not set");
        }
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

        const credentialScope = buildCredentialScope(datetime, this.region, this.serviceName);
        const signedHeaders = buildCanonicalSignedHeaders(request.headers);

        const credentials = typeof this.credentials === "function" ? await this.credentials() : this.credentials;

        const signature = generateSignature(request, credentials, this.region, this.serviceName, datetime, credentialScope);

        // add authorization header with signature
        request.headers[AUTHORIZATION] = buildAuthorizationHeader(signature, credentials.accessKeyId + "/" + credentialScope, signedHeaders);

        // add security token (for temporary credentials)
        if (credentials.sessionToken) {
            request.headers[X_AMZ_SECURITY_TOKEN] = credentials.sessionToken;
        }

        // need to remove the host header if we"re in the browser as it"s protected and cannot be set
        delete request.headers[HOST];
    };
}

export class AwsV4PresignedUrlGenerator {
    private readonly credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
    private readonly region: string;
    private readonly serviceName: string;

    constructor(config?: { credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>, region?: string, serviceName?: string }) {
        this.credentials = config?.credentials ?? fromEnv();
        this.region = config?.region ?? process.env.AWS_REGION;
        this.serviceName = config?.serviceName ?? "execute-api";

        if (!this.region) {
            throw new McmaException("AwsV4Authenticator: AWS_REGION is not set");
        }
    }

    async generatePresignedUrl(method: Method, requestUrl: string, expires = 300) {
        // parse the url we want to sign so we can work with the query string
        const requestUrlParsed = new URL(requestUrl);

        // gather inputs for generating the signature
        const headers: { [key: string]: string } = {};
        headers[HOST] = requestUrlParsed.host;

        const datetime = getAwsDate();
        const credentialScope = buildCredentialScope(datetime, this.region, this.serviceName);
        const signedHeaders = buildCanonicalSignedHeaders(headers);

        const credentials = typeof this.credentials === "function" ? await this.credentials() : this.credentials;

        // add parameters for signing
        requestUrlParsed.searchParams.set(X_AMZ_ALGORITHM_QUERY_PARAM, AWS_SHA_256);
        requestUrlParsed.searchParams.set(X_AMZ_CREDENTIAL_QUERY_PARAM, credentials.accessKeyId + "/" + credentialScope);
        requestUrlParsed.searchParams.set(X_AMZ_DATE_QUERY_PARAM, datetime);
        requestUrlParsed.searchParams.set(X_AMZ_EXPIRES_QUERY_PARAM, expires.toString());
        requestUrlParsed.searchParams.set(X_AMZ_SIGNEDHEADERS_QUERY_PARAM, signedHeaders);

        // not sure if this should be added before or after we generate the signature...
        if (credentials.sessionToken) {
            requestUrlParsed.searchParams.set(X_AMZ_SECURITY_TOKEN_QUERY_PARAM, credentials.sessionToken);
        }

        let params: { [key: string]: string } = {};
        for (let entry of requestUrlParsed.searchParams.entries()) {
            params[entry[0]] = entry[1];
        }

        // build a mock request to use to generate the signature
        const mockRequest = {
            method: method,
            url: requestUrl,
            params,
            headers
        };

        // add the signature to the existing query object
        requestUrlParsed.searchParams.set(X_AMZ_SIGNATURE_QUERY_PARAM, generateSignature(mockRequest, credentials, this.region, this.serviceName, datetime, credentialScope));

        return requestUrlParsed.toString();
    };
}
