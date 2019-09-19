const { Locator } = require("@mcma/core");

class AwsS3FileLocator extends Locator {
    constructor(properties) {
        super("AwsS3FileLocator", properties);

        this.checkProperty("awsS3Bucket", "string", true);
        this.checkProperty("awsS3Key", "string", true);
    }
}

class AwsS3FolderLocator extends Locator {
    constructor(properties) {
        super("AwsS3FolderLocator", properties);

        this.checkProperty("awsS3Bucket", "string", true);
        this.checkProperty("awsS3KeyPrefix", "string", false);
    }
}

module.exports = {
    AwsS3FileLocator,
    AwsS3FolderLocator
};
