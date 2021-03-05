import { S3 } from "aws-sdk";

export async function buildS3Url(bucket: string, key: string, s3: S3): Promise<string>;
export async function buildS3Url(bucket: string, key: string, region: string): Promise<string>;
export async function buildS3Url(bucket: string, key: string, s3OrRegion: S3 | string): Promise<string> {
    // get the region (provided or by calling getBucketLocation)
    let region: string;
    if (typeof s3OrRegion !== "string") {
        const data = await s3OrRegion.getBucketLocation({ Bucket: bucket }).promise();
        region = data.LocationConstraint;
    } else {
        region = s3OrRegion;
    }

    if (bucket.indexOf(".") >= 0) {
        return `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
    } else {
        return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }
}
