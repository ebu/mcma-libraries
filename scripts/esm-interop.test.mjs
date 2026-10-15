import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { pluralizeKebabCase } from '../base/api/dist/lib/strings.js';
import { AwsV4Authenticator, AwsV4PresignedUrlGenerator } from '../aws/client/dist/index.js';

test('ESM API helpers can call the CommonJS pluralize dependency', () => {
    assert.equal(pluralizeKebabCase('job-assignment'), 'job-assignments');
    assert.equal(pluralizeKebabCase('person'), 'people');
});

test('ESM AWS signers can call CryptoJS without cloud credentials', async () => {
    const config = { credentials: { accessKeyId: 'test-access-key', secretAccessKey: 'test-secret-key' } };
    const url = 'https://example.execute-api.eu-west-1.amazonaws.com/jobs';
    const request = { method: 'GET', url };
    await new AwsV4Authenticator(config).sign(request);
    assert.match(request.headers.Authorization, /Credential=test-access-key\/\d{8}\/eu-west-1\/execute-api\/aws4_request/);
    assert.match(request.headers.Authorization, /Signature=[a-f0-9]{64}$/);
    const presigned = new URL(await new AwsV4PresignedUrlGenerator(config).generatePresignedUrl('GET', url));
    assert.match(presigned.searchParams.get('X-Amz-Signature'), /^[a-f0-9]{64}$/);
});

test('ESM Azure logger reads the current CommonJS default client', async (t) => {
    // Load the exact dependency instance used by the provider, without starting telemetry.
    const require = createRequire(new URL('../azure/logger/package.json', import.meta.url));
    const appInsights = require('applicationinsights');
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    try {
        const { AppInsightsLoggerProvider } = await import('../azure/logger/dist/index.js');
        let flushed = false;
        // Setup after import exposes stale CommonJS namespace snapshots. Do not call start().
        appInsights.setup('InstrumentationKey=00000000-0000-0000-0000-000000000000');
        // This client was never started, so there is no telemetry provider to shut down.
        t.mock.method(appInsights.defaultClient, 'shutdown', async () => {});
        t.mock.method(appInsights.defaultClient, 'flush', () => { flushed = true; });
        new AppInsightsLoggerProvider('test').flush();
        assert.equal(flushed, true);
    } finally {
        appInsights.dispose();
        if (connectionString !== undefined) process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = connectionString;
    }
});
