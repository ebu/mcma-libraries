import {S3} from "aws-sdk";

import {AwsS3LocatorProperties} from "./s3-locator";
import {AwsS3FileLocatorProperties} from "./s3-file-locator";
import {AwsS3FolderLocatorProperties} from "./s3-folder-locator";

export function isAwsS3FileLocator(x: any): x is AwsS3FileLocatorProperties {
    return x.key !== undefined;
}

export function isAwsS3FolderLocator(x: any): x is AwsS3FolderLocatorProperties {
    return x.keyPrefix !== undefined;
}

function getS3RelativePath(s3Locator: AwsS3LocatorProperties) {
    if (isAwsS3FileLocator(s3Locator)) {
        return s3Locator.key;
    } else if (isAwsS3FolderLocator(s3Locator)) {
        return s3Locator.keyPrefix;
    } else {
        return "";
    }
}

export async function getS3Url(s3Locator: AwsS3LocatorProperties, s3: S3, force?: boolean): Promise<string>;
export async function getS3Url(s3Locator: AwsS3LocatorProperties, region: string, force?: boolean): Promise<string>;
export async function getS3Url(s3Locator: AwsS3LocatorProperties, s3OrRegion: S3 | string, force = true): Promise<string> {
    // if the url is set and it's not being forced, just return the existing value
    if (s3Locator.url && s3Locator.url.length && !force) {
        return s3Locator.url;
    }

    // get the region (provided or by calling getBucketLocation)
    let region: string;
    if (typeof s3OrRegion !== "string") {
        const data = await s3OrRegion.getBucketLocation({ Bucket: s3Locator.bucket }).promise();
        region = data.LocationConstraint;
    } else {
        region = s3OrRegion;
    }

    // if the region is "us-east-1", the subdomain should just be "s3" without the region appended
    if (region === "us-east-1") {
        region = "";
    }
    
    // build the subdomain from the region
    const s3SubDomain = "s3" + ((region ?? "").length > 0 ? "-" + region : "");
    
    // build the url
    const url = `https://${s3SubDomain}.amazonaws.com/${s3Locator.bucket}/${getS3RelativePath(s3Locator)}`;

    // set it on the locator before we return so the next time it will already be set
    s3Locator.url = url;

    // 
    return url;
}