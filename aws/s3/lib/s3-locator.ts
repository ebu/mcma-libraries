import { Locator, LocatorProperties, McmaException } from "@mcma/core";

export interface S3LocatorProperties extends LocatorProperties {
    region?: string;
    bucket?: string;
    key?: string;
    endpointUrl?: string;
}

export class S3Locator extends Locator implements S3LocatorProperties {
    public region: string;
    public bucket: string;
    public key: string;
    public endpointUrl?: string;

    constructor(properties: S3LocatorProperties) {
        super("S3Locator", properties);

        if (properties.endpointUrl) {
            if (!this.url.startsWith(properties.endpointUrl)) {
                throw new McmaException("Provided endpointUrl does not match the provided url")
            }
            this.endpointUrl = properties.endpointUrl;
        }

        const url = new URL(this.url);
        const pathname = decodeURIComponent(url.pathname.replace(/\+/g, "%20"));

        // checking domain name
        const parts = url.hostname.split(".");
        if (parts.length < 3 ||
            parts[parts.length - 1] !== "com" ||
            parts[parts.length - 2] !== "amazonaws") {

            let startBucketName = 1;

            if (this.endpointUrl) {
                // in case of provided endpointUrl we need to ignore any
                // path components to determine start of bucket name
                const endpointUrl = new URL(this.endpointUrl);
                const endpointPathname = decodeURIComponent(endpointUrl.pathname.replace(/\+/g, "%20"));
                startBucketName = endpointPathname.length;
            }

            // in case it's not a S3 bucket hosted on AWS we assume path style and no region
            const endBucketName = pathname.indexOf("/", startBucketName);
            if (endBucketName < 0) {
                throw new McmaException("Invalid S3 url. Failed to determine bucket");
            }
            this.region = "";
            this.bucket = pathname.substring(startBucketName, endBucketName);
            this.key = pathname.substring(endBucketName + 1);
            return;
        }

        // determining region
        let oldStyle = false;

        if (parts[parts.length - 3].startsWith("s3-")) {
            this.region = parts[parts.length - 3].substring(3);
            oldStyle = true;
        } else if (parts[parts.length - 3] === "s3") {
            this.region = "us-east-1";
            oldStyle = true;
        } else if (parts[parts.length - 4] === "s3") {
            this.region = parts[parts.length - 3];
        } else {
            throw new McmaException("Invalid S3 url. Failed to determine region");
        }

        // determining bucket and key
        const pathStyle = parts.length === (oldStyle ? 3 : 4);
        if (pathStyle) {
            const pos = pathname.indexOf("/", 1);
            if (pos < 0) {
                throw new McmaException("Invalid S3 url. Failed to determine bucket");
            }
            this.bucket = pathname.substring(1, pos);
            this.key = pathname.substring(pos + 1);
        } else {
            this.bucket = parts.slice(0, parts.length - (oldStyle ? 3 : 4)).join(".");
            this.key = pathname.substring(1);
        }
    }
}
