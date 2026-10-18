import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AzureFunctions from '@azure/functions';
import { McmaApiRouteCollection } from '@mcma/api';
import { AzureFunctionApiController } from '@mcma/azure-functions-api';
import { AzureFunctionsLoggerProvider } from '@mcma/azure-logger';

function context(invocationId) {
    const events = [];
    const ctx = { invocationId, events };
    for (const level of ['error', 'warn', 'info', 'debug', 'trace']) {
        ctx[level] = function (message) {
            assert.equal(this, ctx, 'host methods retain their receiver');
            assert.equal(message.includes('\n'), false);
            events.push({ hostLevel: level, ...JSON.parse(message) });
        };
    }
    return ctx;
}

test('Azure API controller and handler logs share the invocation request ID', async () => {
    const originalDirectory = process.cwd();
    const directory = mkdtempSync(join(tmpdir(), 'mcma-azure-request-id-'));
    try {
        writeFileSync(join(directory, 'host.json'), JSON.stringify({ extensions: { http: { routePrefix: '' } } }));
        process.chdir(directory);
        const provider = new AzureFunctionsLoggerProvider('api');
        const routes = new McmaApiRouteCollection().addRoute('GET', '/jobs', async ctx => {
            const logger = await ctx.getLogger();
            await setImmediate();
            logger.info('route');
            ctx.response.body = { requestId: ctx.request.id };
        });
        const controller = new AzureFunctionApiController({ routes, loggerProvider: provider });
        await Promise.all(['invocation-a', 'invocation-b'].map(async id => {
            const ctx = context(id);
            await provider.runWithContext(ctx, async () => {
                (await provider.get(ctx.invocationId)).info('handler');
                const response = await controller.handleRequest(new AzureFunctions.HttpRequest({ url: 'https://service.test/jobs', method: 'GET' }), ctx);
                assert.equal(response.status, 200);
                assert.equal(JSON.parse(response.body).requestId, id);
            });
            assert.ok(ctx.events.some(e => e.message === 'handler'));
            assert.ok(ctx.events.some(e => e.message === 'route'));
            for (const event of ctx.events) {
                assert.equal(event.requestId, id);
                assert.equal(Object.hasOwn(event, 'invocationId'), false);
            }
        }));
    } finally {
        process.chdir(originalDirectory);
        rmSync(directory, { recursive: true, force: true });
    }
});

test('host logging preserves MCMA fields and maps all severities', async () => {
    const provider = new AzureFunctionsLoggerProvider('worker');
    const ctx = context('invocation');
    await provider.runWithContext(ctx, async () => {
        const logger = await provider.get('request', { id: 'tracker', label: 'copy', custom: { jobId: 'job' } });
        for (const method of ['fatal', 'error', 'warn', 'info', 'debug', 'functionStart', 'functionEnd', 'jobStart', 'jobUpdate', 'jobEnd']) {
            logger[method]('job %s', 'test');
        }
        logger.log(0, 'TRACE', 'trace');
    });
    assert.deepEqual(ctx.events.map(e => e.type), ['FATAL','ERROR','WARN','INFO','DEBUG','FUNCTION_START','FUNCTION_END','JOB_START','JOB_UPDATE','JOB_END','TRACE']);
    assert.deepEqual(ctx.events.map(e => e.level), [100,200,300,400,500,450,450,400,400,400,0]);
    assert.deepEqual(ctx.events.map(e => e.hostLevel), ['error','error','warn','info','debug','debug','debug','info','info','info','trace']);
    for (const event of ctx.events) {
        assert.equal(event.source, 'worker');
        assert.equal(event.requestId, 'request');
        assert.equal(Object.hasOwn(event, 'invocationId'), false);
        assert.equal(event.trackerId, 'tracker');
        assert.equal(event.trackerLabel, 'copy');
        assert.equal(event.trackerJobId, 'job');
        assert.ok(Number.isFinite(Date.parse(event.timestamp)));
    }
    assert.equal(ctx.events[0].message, 'job test');
});

test('overlapping invocations keep request IDs, trackers, and host destinations isolated', async () => {
    const provider = new AzureFunctionsLoggerProvider('worker');
    const contexts = Array.from({ length: 20 }, (_, i) => context(`invocation-${i}`));
    await Promise.all(contexts.map(ctx => provider.runWithContext(ctx, async () => {
        await setImmediate();
        const logger = await provider.get(undefined, { id: ctx.invocationId });
        logger.info('before');
        await setImmediate();
        (await provider.get()).info('nested dependency');
        await setImmediate();
        logger.info('after');
    })));
    for (const ctx of contexts) {
        assert.equal(ctx.events.length, 3);
        for (const event of ctx.events) {
            assert.equal(event.requestId, ctx.invocationId);
            assert.equal(Object.hasOwn(event, 'invocationId'), false);
        }
        assert.equal(ctx.events[2].trackerId, ctx.invocationId);
    }
    await assert.rejects(provider.get(), /runWithContext/);
});

test('nested scopes and failures restore the outer invocation', async () => {
    const provider = new AzureFunctionsLoggerProvider('api');
    const outer = context('outer'), inner = context('inner');
    const failure = new Error('handler failed');
    await provider.runWithContext(outer, async () => {
        assert.throws(() => provider.runWithContext(inner, () => { throw failure; }), e => e === failure);
        await assert.rejects(provider.runWithContext(inner, async () => {
            (await provider.get()).warn('inner');
            throw failure;
        }), e => e === failure);
        (await provider.get()).info('outer');
    });
    assert.equal(outer.events[0].requestId, 'outer');
    assert.equal(inner.events[0].requestId, 'inner');
    await assert.rejects(provider.get(), /runWithContext/);
    assert.equal(provider.runWithContext(outer, () => 42), 42);
});

test('loggers capture their original context even when used in another scope', async () => {
    const provider = new AzureFunctionsLoggerProvider('worker');
    const first = context('first'), second = context('second');
    await provider.runWithContext(first, async () => {
        const logger = await provider.get();
        await provider.runWithContext(second, async () => {
            logger.info('first');
            (await provider.get()).info('second');
        });
    });
    assert.equal(first.events[0].message, 'first');
    assert.equal(second.events[0].message, 'second');
});

test('errors and cyclic messages remain useful diagnostics', async () => {
    const provider = new AzureFunctionsLoggerProvider('worker');
    const ctx = context('invocation');
    const error = new Error('copy failed');
    const cyclic = { job: 'test' };
    cyclic.self = cyclic;
    await provider.runWithContext(ctx, async () => {
        const logger = await provider.get();
        logger.error(error);
        logger.debug(cyclic);
        logger.info({ bytes: 123 });
    });
    assert.equal(ctx.events[0].message, error.stack);
    assert.match(ctx.events[1].message, /Circular/);
    assert.deepEqual(ctx.events[2].message, { bytes: 123 });
    assert.equal(cyclic.self, cyclic);
});
