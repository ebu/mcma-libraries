import assert from "node:assert/strict";
import { test } from "node:test";
import { CloudWatchLogsClient, DescribeLogGroupsCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { AwsCloudWatchLoggerProvider } from "../../dist";

test("provider sends serialized diagnostics through the CloudWatch client", async () => {
    const batches: PutLogEventsCommand[] = [];
    const fakeClient = {
        async send(command: unknown) {
            if (command instanceof DescribeLogGroupsCommand) return { logGroups: [{ logGroupName: "test-group" }] };
            if (command instanceof PutLogEventsCommand) batches.push(command);
            return {};
        }
    } as unknown as CloudWatchLogsClient;
    const provider = new AwsCloudWatchLoggerProvider("test", "test-group", fakeClient);
    const logger = await provider.get("request-1");
    const message = Object.freeze({ jobId: "job-1", headers: { "content-type": "application/json" } });
    logger.debug(message);
    await provider.flush(new Date(Date.now() + 5000));
    assert.equal(batches.length, 1);
    const output = JSON.parse(batches[0].input.logEvents![0].message!);
    assert.deepEqual(output.message, message);
    assert.equal(output.requestId, "request-1");
    assert.equal(output.type, "DEBUG");
    assert.equal(batches[0].input.logGroupName, "test-group");
});
