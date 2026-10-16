import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AccessTokenAuthenticator, AuthProvider, HttpClient, McmaApiKeyAuthenticator, ResourceManager } from '@mcma/client';
import { McmaException, Utils } from '@mcma/core';
import { serve, httpConfig } from './http-fixture.mjs';

test('HTTP requests resolve the URL before signing and transmit tracker and JSON data', async t => {
    const fixture = await serve(t, () => ({ body: { dateCreated: '2026-01-02T03:04:05Z' } }));
    const signed = [];
    const client = new HttpClient({ async sign(config) {
        signed.push(config.url);
        config.headers['x-test-signature'] = 'signed';
    } }, { ...httpConfig, axiosConfig: { ...httpConfig.axiosConfig, baseURL: `${fixture.url}/jobs/` } });
    const tracker = { id: 'tracker-1', label: 'test' };
    const result = await client.post({ size: 0 }, '/1', { tracker });
    assert.deepEqual(signed, [`${fixture.url}/jobs/1`]);
    assert.equal(fixture.requests[0].method, 'POST');
    assert.deepEqual(JSON.parse(fixture.requests[0].body), { size: 0 });
    assert.equal(fixture.requests[0].headers['x-test-signature'], 'signed');
    assert.deepEqual(JSON.parse(Utils.fromBase64(fixture.requests[0].headers['mcma-tracker'])), tracker);
    assert.equal(result.data.dateCreated.toISOString(), '2026-01-02T03:04:05.000Z');
});

for (const status of [404, 503]) test(`HTTP ${status} is retried and every attempt is signed`, async t => {
    const fixture = await serve(t, (_, attempt) => ({ status: attempt < 3 ? status : 200, body: { ready: true } }));
    let signs = 0;
    const client = new HttpClient({ async sign(config) {
        config.headers = { ...config.headers, 'x-attempt': String(++signs) };
    } }, httpConfig);
    assert.deepEqual((await client.get(fixture.url)).data, { ready: true });
    assert.equal(signs, 3);
    assert.deepEqual(fixture.requests.map(r => r.headers['x-attempt']), ['1', '2', '3']);
});

test('HTTP retries are bounded and errors retain the response without exposing API keys in context', async t => {
    const fixture = await serve(t, () => ({ status: 503, body: { message: 'unavailable' } }));
    const headers = { 'x-api-key': 'test-secret-1', 'x-mcma-api-key': 'test-secret-2' };
    await assert.rejects(new HttpClient(undefined, httpConfig).get(fixture.url, { headers }), error => {
        assert.ok(error instanceof McmaException);
        assert.equal(error.cause.response.status, 503);
        assert.deepEqual(error.context.response, { message: 'unavailable' });
        assert.equal(error.context.config.headers['x-api-key'], '********');
        assert.equal(error.context.config.headers['x-mcma-api-key'], '********');
        return true;
    });
    assert.equal(fixture.requests.length, 3);
    assert.equal(headers['x-api-key'], 'test-secret-1');
});

test('HTTP authorization failures are not retried, including requests without headers', async t => {
    const fixture = await serve(t, () => ({ status: 401, body: { message: 'denied' } }));
    await assert.rejects(new HttpClient(undefined, httpConfig).get(fixture.url), error => {
        assert.ok(error instanceof McmaException);
        assert.equal(error.cause.response.status, 401);
        return true;
    });
    assert.equal(fixture.requests.length, 1);
});

test('HTTP preserves text responses and uses resource IDs for updates and deletes', async t => {
    const fixture = await serve(t, () => ({ body: 'plain text', headers: { 'content-type': 'text/plain' } }));
    const client = new HttpClient(undefined, httpConfig);
    const id = `${fixture.url}/jobs/1`;
    assert.equal((await client.put({ id, count: 0 })).data, 'plain text');
    await client.patch({ count: 1 }, id);
    await client.delete(id);
    assert.deepEqual(fixture.requests.map(r => [r.method, r.url]), [['PUT', '/jobs/1'], ['PATCH', '/jobs/1'], ['DELETE', '/jobs/1']]);
    assert.deepEqual(JSON.parse(fixture.requests[1].body), { count: 1 });
});

test('HTTP rejects missing URLs and unrelated base URLs before sending', async t => {
    const fixture = await serve(t, () => ({}));
    await assert.rejects(new HttpClient(undefined, httpConfig).get(), /Missing url/);
    const client = new HttpClient(undefined, { ...httpConfig, axiosConfig: { ...httpConfig.axiosConfig, baseURL: fixture.url } });
    await assert.rejects(client.get('https://unrelated.invalid/jobs'), /does not match baseURL/);
    assert.equal(fixture.requests.length, 0);
});

test('auth providers select types case insensitively and only infer a single default', () => {
    const one = { async sign() {} }, two = { async sign() {} };
    const provider = new AuthProvider().add({ authType: 'One', authenticator: one });
    assert.equal(provider.get('oNE'), one);
    assert.equal(provider.getDefault(), one);
    provider.add({ authType: 'Two', authenticator: two });
    assert.equal(provider.getDefault(), null);
    assert.equal(provider.get('missing'), undefined);
});

test('API-key authentication loads the secret once and preserves other headers', async () => {
    const loads = [];
    const auth = new McmaApiKeyAuthenticator({ apiKeySecretId: 'test-key', secretsProvider: {
        async get(id) { loads.push(id); return 'test-secret'; }
    } });
    const first = { headers: { accept: 'application/json' } }, second = {};
    await auth.sign(first);
    await auth.sign(second);
    assert.deepEqual(loads, ['test-key']);
    assert.deepEqual(first.headers, { accept: 'application/json', 'x-mcma-api-key': 'test-secret' });
    assert.equal(second.headers['x-mcma-api-key'], 'test-secret');
});

for (const expiresOn of [2000, new Date(2000)]) test(`access tokens refresh expired ${typeof expiresOn} timestamps and reuse valid tokens`, async t => {
    let now = 1000;
    t.mock.method(Date, 'now', () => now);
    const authContext = { audience: 'test' };
    let calls = 0;
    const auth = new AccessTokenAuthenticator({ async getAccessToken(context) {
        assert.equal(context, authContext);
        calls++;
        return calls === 1 ? { accessToken: 'initial', expiresOn } :
            { accessToken: 'current', expiresOn: new Date('2999-01-01T00:00:00Z') };
    } }, authContext);
    const first = {}, refreshed = { headers: { accept: 'application/json' } }, cached = {};
    await auth.sign(first);
    await auth.sign(cached);
    assert.equal(cached.headers.Authorization, 'Bearer initial');
    assert.equal(calls, 1);
    now = 2000;
    await auth.sign(refreshed);
    await auth.sign(cached);
    assert.equal(first.headers.Authorization, 'Bearer initial');
    assert.deepEqual(refreshed.headers, { accept: 'application/json', Authorization: 'Bearer current' });
    assert.equal(cached.headers.Authorization, 'Bearer current');
    assert.equal(calls, 2);
});

test('token-provider errors propagate without setting an authorization header', async () => {
    const error = new Error('identity service unavailable');
    const auth = new AccessTokenAuthenticator({ async getAccessToken() { throw error; } }, {});
    const config = { headers: { accept: 'application/json' } };
    await assert.rejects(auth.sign(config), value => value === error);
    assert.deepEqual(config.headers, { accept: 'application/json' });
});

test('resource discovery selects endpoint auth before fallback and respects path boundaries', async t => {
    let url;
    const fixture = await serve(t, request => ({ body: request.url === '/registry/services' ? { results: [{
        name: 'Storage', authType: 'service', resources: [
            { resourceType: 'StorageJob', httpEndpoint: `${url}/media`, authType: 'endpoint' },
            { resourceType: 'JobProfile', httpEndpoint: `${url}/profiles` }
        ]
    }] } : { ok: true } }));
    url = fixture.url;
    const provider = new AuthProvider();
    for (const name of ['registry', 'service', 'endpoint', 'fallback']) provider.add({ authType: name,
        authenticator: { async sign(config) { config.headers = { ...config.headers, 'x-auth': name }; } } });
    const manager = new ResourceManager({ serviceRegistryUrl: `${url}/registry/`, serviceRegistryAuthType: 'registry', httpClientConfig: httpConfig }, provider);
    for (const path of ['/media', '/media/1', '/media?q=1', '/profiles/1', '/media-old', '/unknown']) {
        const client = await manager.getHttpClient(`${url}${path}`, path === '/unknown' ? undefined : 'fallback');
        await client.get(`${url}${path}`);
    }
    assert.deepEqual(fixture.requests.map(r => [r.url, r.headers['x-auth']]), [
        ['/registry/services', 'registry'], ['/media', 'endpoint'], ['/media/1', 'endpoint'],
        ['/media?q=1', 'endpoint'], ['/profiles/1', 'service'], ['/media-old', 'fallback'], ['/unknown', 'registry']
    ]);
    await assert.rejects(manager.getHttpClient(`${url}/unknown`, 'missing'), /No authenticator registered/);
    // A discovered endpoint remains authoritative even when the requested fallback is unknown.
    await (await manager.getHttpClient(`${url}/media/2`, 'missing')).get(`${url}/media/2`);
    assert.equal(fixture.requests.at(-1).headers['x-auth'], 'endpoint');
});

test('resource queries deduplicate shared endpoints and send filtering and sorting parameters', async t => {
    let url;
    const fixture = await serve(t, request => {
        if (request.url === '/registry/services') return { body: { results: ['one', 'two'].map(name => ({
            name, resources: [{ resourceType: 'StorageJob', httpEndpoint: `${url}/jobs` }]
        })) } };
        return { body: { results: [{ '@type': 'StorageJob', id: `${url}/jobs/1` }] } };
    });
    url = fixture.url;
    const manager = new ResourceManager({ serviceRegistryUrl: `${url}/registry`, httpClientConfig: httpConfig }, new AuthProvider());
    const jobs = await manager.query('StorageJob', { status: 'Completed' }, 'dateCreated', 'desc');
    assert.deepEqual(jobs, [{ '@type': 'StorageJob', id: `${url}/jobs/1` }]);
    assert.equal(fixture.requests.length, 2);
    const requested = new URL(fixture.requests[1].url, url);
    assert.equal(requested.pathname, '/jobs');
    assert.deepEqual(Object.fromEntries(requested.searchParams), { sortBy: 'dateCreated', sortOrder: 'desc', status: 'Completed' });
    assert.deepEqual(await manager.query('UnknownResource'), []);
    assert.equal(fixture.requests.length, 2);
});

test('resource create, get, update, notification and delete use discovered endpoints', async t => {
    let url;
    const fixture = await serve(t, request => {
        if (request.url === '/registry/services') return { body: { results: [{ name: 'Storage', resources: [
            { resourceType: 'StorageJob', httpEndpoint: `${url}/jobs` }
        ] }] } };
        if (request.url === '/invalid') return { body: ['not a resource'] };
        if (request.url === '/empty') return { body: 'null' };
        if (request.method === 'POST' && request.url === '/jobs') return { status: 201,
            body: { ...JSON.parse(request.body), id: `${url}/jobs/1` } };
        return { body: { '@type': 'StorageJob', id: `${url}/jobs/1` } };
    });
    url = fixture.url;
    const manager = new ResourceManager({ serviceRegistryUrl: `${url}/registry`, httpClientConfig: httpConfig }, new AuthProvider());
    const resource = await manager.create({ '@type': 'StorageJob' });
    assert.equal(resource.id, `${url}/jobs/1`);
    assert.deepEqual(await manager.get(resource.id), resource);
    await manager.update({ ...resource, custom: { size: 0 } });
    await manager.sendNotification({ ...resource, notificationEndpoint: { httpEndpoint: `${url}/notify` } });
    await manager.delete(resource);
    assert.deepEqual(fixture.requests.slice(1).map(r => [r.method, r.url]), [
        ['POST', '/jobs'], ['GET', '/jobs/1'], ['PUT', '/jobs/1'], ['POST', '/notify'], ['DELETE', '/jobs/1']
    ]);
    assert.deepEqual(JSON.parse(fixture.requests[3].body).custom, { size: 0 });
    const notification = JSON.parse(fixture.requests[4].body);
    assert.equal(notification['@type'], 'Notification');
    assert.equal(notification.source, resource.id);
    assert.equal(notification.content.id, resource.id);
    await assert.rejects(manager.get(`${url}/invalid`), /illegal type 'Array'/);
    assert.equal(await manager.get(`${url}/empty`), null);
    await assert.rejects(manager.create({ '@type': 'Unknown' }), /Failed to find service/);
    await assert.rejects(manager.delete(42), /Unexpected input/);
});
