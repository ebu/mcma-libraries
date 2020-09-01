import { Locator } from "@mcma/core";

export interface AwsS3LocatorProperties {
    bucket: string;
    url?: string;
}

export abstract class AwsS3Locator extends Locator implements AwsS3LocatorProperties {
    public bucket: string;
    public url?: string;
    
    public abstract readonly path: string;
    
    protected constructor(type: string, properties: AwsS3LocatorProperties) {
        super(type, properties);

        this.checkProperty("bucket", "string", true);
    }
}