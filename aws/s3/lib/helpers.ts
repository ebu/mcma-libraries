import { GetBucketLocationCommand, S3Client } from "@aws-sdk/client-s3";
import { Locator } from "@mcma/core";
import { S3Locator } from "./s3-locator";

export async function buildS3Url(bucket: string, key: string, s3: S3Client): Promise<string>;
export async function buildS3Url(bucket: string, key: string, region: string): Promise<string>;
export async function buildS3Url(bucket: string, key: string, s3OrRegion: S3Client | string): Promise<string> {
    // get the region (provided or by calling getBucketLocation)
    let region: string;
    if (typeof s3OrRegion !== "string") {
        const data = await s3OrRegion.send(new GetBucketLocationCommand({ Bucket: bucket }));
        region = data.LocationConstraint;
        if (!region) {
            region = "us-east-1";
        }
    } else {
        region = s3OrRegion;
    }

    if (bucket.indexOf(".") >= 0) {
        return encodeURI(`https://s3.${region}.amazonaws.com/${bucket}/${key}`);
    } else {
        return encodeURI(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
    }
}

export function isS3Locator(x: Locator): x is S3Locator {
    return typeof x === "object" && x["@type"] === "S3Locator";
}
