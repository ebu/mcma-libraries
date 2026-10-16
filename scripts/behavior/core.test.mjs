import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    ConfigVariables, JobParameterBag, McmaException, ResourceEndpoint, Service,
    Utils, onResourceCreate, onResourceUpsert
} from '@mcma/core';

test('configuration is case insensitive, preserves empty values and snapshots its input', () => {
    const input = { Service_URL: 'https://service.test', EMPTY: '', UNSET: undefined };
    const config = new ConfigVariables(input);
    input.Service_URL = 'changed';
    assert.equal(config.get('service_url'), 'https://service.test');
    assert.equal(config.getOptional('empty', 'fallback'), '');
    assert.equal(config.getOptional('unset', 'fallback'), 'fallback');
    assert.equal(config.getOptional('missing'), undefined);
    assert.throws(() => config.get('missing'), /No environment variable/);
    assert.throws(() => config.get(''), /Invalid name/);
    assert.throws(() => config.getOptional(''), /Invalid name/);
});

test('resource constructors restore dates and endpoints without modifying input', () => {
    const input = { name: 'Storage', dateCreated: '2026-01-02T03:04:05Z', dateModified: 'invalid',
        custom: { region: 'eu' }, jobProfileIds: ['profile-a'],
        resources: [{ resourceType: 'StorageJob', httpEndpoint: 'https://service.test/jobs' }] };
    const original = structuredClone(input);
    const service = new Service(input);
    assert.equal(service['@type'], 'Service');
    assert.equal(service.dateCreated.toISOString(), '2026-01-02T03:04:05.000Z');
    assert.equal(service.dateModified, undefined);
    assert.ok(service.resources[0] instanceof ResourceEndpoint);
    service.custom.region = 'us';
    service.jobProfileIds.push('profile-b');
    service.resources[0].httpEndpoint = 'https://elsewhere.test';
    assert.deepEqual(input, original);
});

test('resource endpoints reject missing types and invalid URLs', () => {
    for (const properties of [
        { httpEndpoint: 'https://service.test' },
        { resourceType: 'Job', httpEndpoint: '/relative' },
        { resourceType: 'Job', httpEndpoint: 12 }
    ]) assert.throws(() => new ResourceEndpoint(properties), McmaException);
    assert.throws(() => new Service({ name: 'Storage' }), /resources/);
});

test('resource creation assigns timestamps; updates preserve the creation date', () => {
    const resource = {};
    const before = Date.now();
    onResourceCreate(resource, 'https://service.test/jobs/1');
    assert.equal(resource.id, 'https://service.test/jobs/1');
    assert.equal(resource.dateCreated.getTime(), resource.dateModified.getTime());
    assert.ok(resource.dateCreated.getTime() >= before && resource.dateCreated.getTime() <= Date.now());
    const originalCreation = new Date('2020-01-01T00:00:00Z');
    resource.dateCreated = originalCreation;
    onResourceUpsert(resource, 'https://service.test/jobs/2');
    assert.equal(resource.dateCreated, originalCreation);
    assert.equal(resource.id, 'https://service.test/jobs/2');
    assert.ok(resource.dateModified > originalCreation);
    const newResource = {};
    onResourceUpsert(newResource, 'new');
    assert.equal(newResource.dateCreated.getTime(), newResource.dateModified.getTime());
});

test('JSON revival handles nested dates and offsets while preserving ordinary values', () => {
    const result = JSON.parse(JSON.stringify({ nested: [
        '2026-01-02T05:04:05+02:00', '2026-01-02', 'not a date', 0, false, null
    ] }), Utils.reviver);
    assert.equal(result.nested[0].toISOString(), '2026-01-02T03:04:05.000Z');
    assert.deepEqual(result.nested.slice(1), ['2026-01-02', 'not a date', 0, false, null]);
    assert.equal(Utils.ensureValidDateOrUndefined('invalid'), undefined);
    assert.equal(Utils.ensureValidDateOrUndefined(null), undefined);
});

test('job parameter bags preserve falsy values and their own type through JSON', () => {
    const bag = new JobParameterBag({ '@type': 'Other', size: 0, enabled: false, text: '', value: null });
    assert.deepEqual(JSON.parse(JSON.stringify(bag)), {
        '@type': 'JobParameterBag', size: 0, enabled: false, text: '', value: null
    });
});

test('exception details preserve the cause and handle cyclic diagnostic context', () => {
    const cause = new Error('underlying failure');
    const context = { jobId: 'job-1' };
    context.self = context;
    const error = new McmaException('operation failed', cause, context);
    assert.equal(error.cause, cause);
    assert.match(error.toString(), /operation failed[\s\S]*Caused by:[\s\S]*underlying failure/);
    assert.match(error.toString(true), /job-1/);
    assert.equal(context.self, context);
});
