import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigVariables, Utils } from '@mcma/core';
import { McmaApiController, McmaApiRequest, McmaApiRequestContext, McmaApiRouteCollection,
    McmaApiKeySecurityMiddleware } from '@mcma/api';

function context(config = {}, loggerProvider) {
    return new McmaApiRequestContext(new McmaApiRequest({
        id: 'request-1', path: '/jobs/123', httpMethod: 'GET', ...config
    }), loggerProvider, new ConfigVariables({}));
}

test('routing decodes path variables and parses JSON dates with mixed-case content type', async () => {
    const routes = new McmaApiRouteCollection().addRoute('POST', '/jobs/{id}', async ctx => {
        assert.equal(ctx.request.pathVariables.id, 'asset 1');
        assert.equal(ctx.getRequestBody().when.toISOString(), '2026-01-02T03:04:05.000Z');
        ctx.setResponseResourceCreated({ id: 'https://service.test/jobs/asset-1' });
    });
    const ctx = context({ httpMethod: 'POST', path: '/jobs/asset%201', headers: { 'Content-Type': 'Application/JSON; charset=utf-8' },
        body: '{"when":"2026-01-02T03:04:05Z"}' });
    await new McmaApiController(routes).handleRequest(ctx);
    assert.equal(ctx.response.statusCode, 201);
    assert.equal(ctx.response.headers.Location, ctx.response.body.id);
    assert.equal(ctx.response.headers['Content-Type'], 'application/json');
});

test('malformed JSON is a 400 and does not invoke the route', async () => {
    let calls = 0;
    const routes = new McmaApiRouteCollection().addRoute('POST', '/jobs/{id}', async () => { calls++; });
    const ctx = context({ httpMethod: 'POST', headers: { 'content-type': 'application/json' }, body: '{invalid' });
    await new McmaApiController(routes).handleRequest(ctx);
    assert.equal(ctx.response.statusCode, 400);
    assert.equal(ctx.response.body['@type'], 'ApiError');
    assert.equal(ctx.response.body.path, '/jobs/123');
    assert.equal(calls, 0);
});

test('routing distinguishes unknown paths, disallowed methods, OPTIONS and CORS preflight', async () => {
    const routes = new McmaApiRouteCollection()
        .addRoute('GET', '/jobs/{id}', async () => {})
        .addRoute('DELETE', '/jobs/{id}', async () => {});
    const controller = new McmaApiController(routes);
    const cases = [
        [{ path: '/unknown' }, 404],
        [{ path: '/jobs/123/extra' }, 404],
        [{ httpMethod: 'POST' }, 405],
        [{ httpMethod: 'OPTIONS' }, 200],
        [{ httpMethod: 'OPTIONS', headers: { 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'x-mcma-api-key' } }, 200]
    ];
    for (const [request, status] of cases) {
        const ctx = context(request);
        await controller.handleRequest(ctx);
        assert.equal(ctx.response.statusCode, status);
        if (status === 405 || request.httpMethod === 'OPTIONS') {
            assert.equal(ctx.response.headers[request.headers ? 'Access-Control-Allow-Methods' : 'Allow'], 'GET, DELETE, OPTIONS');
        }
        if (request.headers) assert.equal(ctx.response.headers['Access-Control-Allow-Headers'], 'x-mcma-api-key');
    }
});

test('middleware wraps routes in declaration order and may stop the pipeline', async () => {
    const events = [];
    const routes = new McmaApiRouteCollection().addRoute('GET', '/jobs/{id}', async () => { events.push('route'); });
    const middleware = name => ({ async execute(ctx, next) {
        events.push(`${name}:before`); await next(ctx); events.push(`${name}:after`);
    } });
    const ctx = context();
    await new McmaApiController(routes, [middleware('first'), middleware('second')]).handleRequest(ctx);
    assert.deepEqual(events, ['first:before', 'second:before', 'route', 'second:after', 'first:after']);
    assert.equal(ctx.response.statusCode, 200);
    events.length = 0;
    const blocked = context();
    await new McmaApiController(routes, [{ async execute(ctx) { ctx.setResponseError(403); } }]).handleRequest(blocked);
    assert.equal(blocked.response.statusCode, 403);
    assert.deepEqual(events, []);
});

test('route exceptions become structured 500 responses and are logged once', async () => {
    const error = new Error('storage unavailable'), logged = [];
    const routes = new McmaApiRouteCollection().addRoute('GET', '/jobs/{id}', async () => { throw error; });
    const ctx = context({}, { async get() { return { error(value) { logged.push(value); } }; } });
    await new McmaApiController(routes).handleRequest(ctx);
    assert.equal(ctx.response.statusCode, 500);
    assert.equal(ctx.response.body.status, 500);
    assert.equal(ctx.response.body.message, 'storage unavailable');
    assert.equal(ctx.response.body.path, '/jobs/123');
    assert.deepEqual(logged, [error]);
});

test('explicit route errors become error bodies and invalid error statuses are rejected', async () => {
    const routes = new McmaApiRouteCollection().addRoute('GET', '/jobs/{id}', async ctx => ctx.setResponseResourceNotFound());
    const ctx = context();
    await new McmaApiController(routes).handleRequest(ctx);
    assert.equal(ctx.response.statusCode, 404);
    assert.equal(ctx.response.body.status, 404);
    assert.match(ctx.response.body.message, /No resource found/);
    assert.throws(() => ctx.setResponseError(200), /4xx or 5xx/);
});

test('API-key permissions distinguish public, authenticated, forbidden and invalid-key requests', async () => {
    let secretReads = 0, routeCalls = 0;
    const middleware = new McmaApiKeySecurityMiddleware({ apiSecurityConfigSecretId: 'security-config', secretsProvider: {
        async getAs(id) {
            assert.equal(id, 'security-config'); secretReads++;
            return { 'no-auth': { '^/health$': ['GET'] }, 'valid-auth': { '^/shared$': ['GET'] },
                'reader-key': { '^/jobs$': ['GET'] }, 'admin-key': { '^/jobs$': ['ANY'] } };
        }
    } });
    const routes = new McmaApiRouteCollection();
    for (const path of ['/health', '/shared', '/jobs']) for (const method of ['GET', 'POST']) {
        routes.addRoute(method, path, async ctx => { routeCalls++; ctx.setResponseBody({ ok: true }); });
    }
    const controller = new McmaApiController(routes, [middleware]);
    const cases = [
        ['/health', 'GET', undefined, 200], ['/health', 'POST', undefined, 401],
        ['/jobs', 'GET', undefined, 401], ['/jobs', 'GET', 'wrong', 401],
        ['/jobs', 'GET', 'no-auth', 401], ['/jobs', 'GET', 'valid-auth', 401],
        ['/jobs', 'GET', 'reader-key', 200], ['/jobs', 'POST', 'reader-key', 403],
        ['/jobs', 'POST', 'admin-key', 200], ['/shared', 'GET', 'reader-key', 200],
        ['/shared', 'GET', 'wrong', 401]
    ];
    for (const [path, httpMethod, key, status] of cases) {
        const ctx = context({ path, httpMethod, headers: key ? { 'x-mcma-api-key': key } : {} });
        await controller.handleRequest(ctx);
        assert.equal(ctx.response.statusCode, status, `${httpMethod} ${path} with ${key}`);
    }
    assert.equal(routeCalls, 4);
    assert.equal(secretReads, 1);
});

test('security configuration failures fail closed without calling a route', async () => {
    let calls = 0;
    const routes = new McmaApiRouteCollection().addRoute('GET', '/jobs/{id}', async () => { calls++; });
    const security = new McmaApiKeySecurityMiddleware({ apiSecurityConfigSecretId: 'unavailable',
        secretsProvider: { async getAs() { throw new Error('secret unavailable'); } } });
    const ctx = context();
    await new McmaApiController(routes, [security]).handleRequest(ctx);
    assert.equal(ctx.response.statusCode, 500);
    assert.equal(calls, 0);
});

test('tracker precedence is header, query, then body, with malformed headers falling back safely', async () => {
    const header = { id: 'header', label: 'header' }, query = { id: 'query', label: 'query' }, body = { id: 'body', label: 'body' };
    const encode = value => Utils.toBase64(JSON.stringify(value));
    assert.equal((await context({ headers: { 'mcma-tracker': encode(header) }, queryStringParameters: { 'mcma-tracker': encode(query) }, body: { tracker: body } }).getTracker()).id, 'header');
    assert.equal((await context({ queryStringParameters: { 'mcma-tracker': encode(query) }, body: { tracker: body } }).getTracker()).id, 'query');
    const warnings = [];
    const ctx = context({ headers: { 'mcma-tracker': 'malformed!' }, body: { tracker: body } },
        { async get() { return { warn(message) { warnings.push(message); } }; } });
    assert.equal((await ctx.getTracker()).id, 'body');
    assert.equal(warnings.length, 1);
});
