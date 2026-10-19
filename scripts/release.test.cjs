const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existingPackage, verifyExisting, integrity } = require('./release.cjs');
const { orderedPackages } = require('./packages.cjs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { validateStagingRun } = require('./staging-run.cjs');

test('finalization accepts only a successful staging run from this repository main branch', () => {
    const valid = { repository: { full_name: 'ebu/mcma-libraries' }, head_repository: { full_name: 'ebu/mcma-libraries' },
        path: '.github/workflows/publish.yml', event: 'workflow_dispatch', head_branch: 'main',
        status: 'completed', conclusion: 'success', head_sha: 'a'.repeat(40) };
    const jobs = [{ name: 'stage', conclusion: 'success' }];
    assert.equal(validateStagingRun(valid, jobs), valid.head_sha);
    assert.equal(validateStagingRun(valid, [{ name: 'Stage 2.0.0', conclusion: 'success' }]), valid.head_sha);
    for (const name of ['Stage 2.0.0', 'stage']) {
        for (const conclusion of ['skipped', 'failure', 'cancelled']) {
            assert.throws(() => validateStagingRun(valid, [{ name, conclusion }]));
        }
    }
    for (const name of ['Prepare 2.0.0', 'Stage ', 'Stage 2.0.0-beta', 'Stage 2.0.0 extra']) {
        assert.throws(() => validateStagingRun(valid, [{ name, conclusion: 'success' }]));
    }
    for (const overrides of [{ repository: { full_name: 'other/repo' } }, { head_repository: { full_name: 'fork/repo' } },
        { path: '.github/workflows/verify.yml' }, { event: 'pull_request' }, { head_branch: 'feature' },
        { status: 'in_progress' }, { conclusion: 'failure' }, { head_sha: 'bad' }]) {
        assert.throws(() => validateStagingRun({ ...valid, ...overrides }, jobs));
    }
    for (const conclusion of ['skipped', 'failure', 'cancelled']) {
        assert.throws(() => validateStagingRun(valid, [{ name: 'stage', conclusion }]));
    }
    assert.throws(() => validateStagingRun(valid, []));
});
test('staging refuses local runs, pull-request events and non-main branches before doing any work', () => {
    const base = { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_REF: 'refs/heads/main', GITHUB_REPOSITORY: 'ebu/mcma-libraries' };
    delete base.ACTIONS_ID_TOKEN_REQUEST_URL;
    for (const overrides of [{ GITHUB_ACTIONS: 'false' }, { GITHUB_EVENT_NAME: 'pull_request' },
        { GITHUB_REF: 'refs/heads/feature' }, { GITHUB_REPOSITORY: 'someone/other-repo' }, {}]) {
        const result = spawnSync(process.execPath, [path.join(__dirname, 'release.cjs'), 'stage'],
            { env: { ...base, ...overrides }, encoding: 'utf8' });
        assert.equal(result.status, 1);
        assert.match(result.stderr, /AssertionError/);
        assert.doesNotMatch(result.stderr, /ENOENT|Registry lookup failed/);
    }
});
test('only an explicit registry E404 counts as unpublished', () => {
    assert.equal(existingPackage({ status: 1, stdout: '{"error":{"code":"E404"}}' }), null);
    for (const code of ['E401', 'E403', 'E429', 'E500', 'ECONNRESET']) {
        assert.throws(() => existingPackage({ status: 1, stdout: JSON.stringify({ error: { code } }) }));
    }
    assert.throws(() => existingPackage({ status: 1, stdout: 'not JSON' }));
});
test('resuming rejects differing bytes or source commits', () => {
    const entry = { name: '@mcma/core', version: '2.0.0', integrity: integrity(Buffer.from('tested tarball')) };
    verifyExisting({ dist: { integrity: entry.integrity }, gitHead: 'commit-a' }, entry, 'commit-a');
    assert.throws(() => verifyExisting({ dist: { integrity: integrity(Buffer.from('other bytes')) }, gitHead: 'commit-a' }, entry, 'commit-a'));
    assert.throws(() => verifyExisting({ dist: { integrity: entry.integrity }, gitHead: 'commit-b' }, entry, 'commit-a'));
});
test('dependency order puts prerequisites first and rejects cycles', () => {
    const core = { manifest: { name: '@mcma/core' } };
    const client = { manifest: { name: '@mcma/client', peerDependencies: { '@mcma/core': '2.0.0' } } };
    assert.deepEqual(orderedPackages([client, core]), [core, client]);
    core.manifest.devDependencies = { '@mcma/client': '2.0.0' };
    assert.throws(() => orderedPackages([core, client]), /cycle/);
});
const { stagePackages, validateArtifacts } = require('./release.cjs');
const { finalizeRelease } = require('./github-release.cjs');
function registryFixture() {
    const manifest = { version: '2.0.0', commit: 'commit-a', packages: ['core', 'client', 'api'].map(name => ({
        name: `@mcma/${name}`, version: '2.0.0', filename: `${name}.tgz`, integrity: integrity(Buffer.from(name))
    })) };
    const remote = new Map(), writes = [], reads = [];
    let waits = 0;
    const metadata = entry => ({ dist: { integrity: entry.integrity }, gitHead: manifest.commit });
    const adapter = {
        lookup(entry) { reads.push(entry.name); return remote.get(entry.name) || null; },
        stageTarball(entry) { writes.push(entry.name); remote.set(entry.name, metadata(entry)); },
        async wait() { waits++; }
    };
    return { manifest, remote, writes, reads, adapter, metadata, waits: () => waits };
}
test('preflights every version before staging in dependency order', async () => {
    const f = registryFixture();
    const publish = f.adapter.stageTarball;
    f.adapter.stageTarball = entry => {
        assert.deepEqual(f.reads.slice(0, 3), f.manifest.packages.map(p => p.name));
        publish(entry);
    };
    await stagePackages(f.manifest, f.adapter);
    assert.deepEqual(f.writes, f.manifest.packages.map(p => p.name));
    assert.equal(f.waits(), 0);
});
test('a conflict or registry failure on the final package prevents every stage', async () => {
    for (const failure of ['bytes', 'commit', 'authorization']) {
        const f = registryFixture(), last = f.manifest.packages[2];
        if (failure === 'authorization') {
            const lookup = f.adapter.lookup;
            f.adapter.lookup = entry => { if (entry === last) throw new Error('E403'); return lookup(entry); };
        } else {
            const value = f.metadata(last);
            if (failure === 'bytes') value.dist.integrity = 'different'; else value.gitHead = 'other';
            f.remote.set(last.name, value);
        }
        await assert.rejects(stagePackages(f.manifest, f.adapter));
        assert.deepEqual(f.writes, []);
    }
});
test('retry skips matching approved packages after an interrupted run', async () => {
    for (const accepted of [false, true]) {
        const f = registryFixture(), publish = f.adapter.stageTarball;
        f.adapter.stageTarball = entry => {
            if (entry === f.manifest.packages[1]) {
                if (accepted) publish(entry);
                throw new Error('connection lost');
            }
            publish(entry);
        };
        await assert.rejects(stagePackages(f.manifest, f.adapter), /Staging .* failed/);
        assert.equal(f.remote.has('@mcma/api'), false);
        f.adapter.stageTarball = publish;
        await stagePackages(f.manifest, f.adapter);
        assert.deepEqual(f.writes, ['@mcma/core', '@mcma/client', '@mcma/api']);
        await stagePackages(f.manifest, f.adapter);
        assert.equal(f.writes.length, 3, 'completed retries must not publish again');
    }
});
test('staging completes without waiting for public registry visibility', async () => {
    const f = registryFixture();
    f.adapter.stageTarball = entry => f.writes.push(entry.name);
    await stagePackages(f.manifest, f.adapter);
    assert.equal(f.writes.length, 3);
    assert.equal(f.remote.size, 0);
});

test('pending stages are not silently skipped; approval allows recovery from a lost response', async () => {
    const f = registryFixture(), pending = new Map();
    f.adapter.stageTarball = entry => {
        if (pending.has(entry.name)) throw new Error('version already staged');
        pending.set(entry.name, f.metadata(entry));
        if (entry === f.manifest.packages[1]) throw new Error('response lost');
    };
    await assert.rejects(stagePackages(f.manifest, f.adapter), /Inspect pending packages/);
    assert.equal(pending.size, 2);
    await assert.rejects(stagePackages(f.manifest, f.adapter), /Inspect pending packages/);
    assert.equal(pending.size, 2, 'retry must stop at the existing pending stage');
    // The maintainer reviews and approves the two stages using npm and 2FA.
    for (const [name, metadata] of pending) f.remote.set(name, metadata);
    pending.clear();
    await stagePackages(f.manifest, f.adapter);
    assert.deepEqual([...pending.keys()], ['@mcma/api']);
});

test('finalization requires every approved package to match the tested artifact', () => {
    const { verifyPublishedPackages } = require('./release.cjs');
    for (const scenario of ['missing', 'bytes', 'commit', 'authorization', 'valid']) {
        const f = registryFixture();
        for (const entry of f.manifest.packages) f.remote.set(entry.name, f.metadata(entry));
        const last = f.manifest.packages[2];
        if (scenario === 'missing') f.remote.delete(last.name);
        if (scenario === 'bytes') f.remote.get(last.name).dist.integrity = 'other';
        if (scenario === 'commit') f.remote.get(last.name).gitHead = 'other';
        if (scenario === 'authorization') f.adapter.lookup = () => { throw new Error('E403'); };
        if (scenario === 'valid') verifyPublishedPackages(f.manifest, f.adapter.lookup);
        else assert.throws(() => verifyPublishedPackages(f.manifest, f.adapter.lookup));
    }
});

test('artifact validation rejects tampering, wrong versions and paths before reading outside the release folder', () => {
    const f = registryFixture();
    const read = filename => Buffer.from(filename.replace('.tgz', ''));
    validateArtifacts(f.manifest, read);
    assert.throws(() => validateArtifacts(f.manifest, () => Buffer.from('tampered')), /Tarball changed/);
    f.manifest.packages[0].version = '1.0.0';
    assert.throws(() => validateArtifacts(f.manifest, read));
    f.manifest.packages[0].version = '2.0.0';
    f.manifest.packages[0].filename = '../outside.tgz';
    let reads = 0;
    assert.throws(() => validateArtifacts(f.manifest, () => { reads++; }));
    assert.equal(reads, 0);
});
function githubFixture() {
    const options = { version: '2.0.0', commit: 'a'.repeat(40), mode: 'create' };
    const state = { ref: null, release: null, writes: [], failRelease: false, tags: new Map() };
    const api = async (endpoint, method = 'GET', body) => {
        if (method === 'GET') {
            if (endpoint === 'git/ref/tags/v2.0.0') return state.ref;
            if (endpoint === 'releases/tags/v2.0.0') return state.release;
            if (endpoint.startsWith('git/tags/')) return state.tags.get(endpoint.slice(9));
        } else {
            state.writes.push({ endpoint, body });
            if (endpoint === 'git/refs') { state.ref = { object: { type: 'commit', sha: body.sha } }; return state.ref; }
            if (endpoint === 'releases') {
                if (state.failRelease) throw new Error('GitHub unavailable');
                state.release = { html_url: 'https://example.test/release' }; return state.release;
            }
        }
        throw new Error(`Unexpected API call ${method} ${endpoint}`);
    };
    return { options, state, api };
}
test('GitHub preflight never creates tags or releases', async () => {
    const f = githubFixture();
    await finalizeRelease({ ...f.options, mode: 'check' }, f.api);
    assert.deepEqual(f.state.writes, []);
});
test('GitHub release retry reuses a tag created before a release API failure', async () => {
    const f = githubFixture();
    f.state.failRelease = true;
    await assert.rejects(finalizeRelease(f.options, f.api), /GitHub unavailable/);
    assert.equal(f.state.ref.object.sha, f.options.commit);
    f.state.failRelease = false;
    await finalizeRelease(f.options, f.api);
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['git/refs', 'releases', 'releases']);
    assert.equal(f.state.writes[0].body.ref, 'refs/tags/v2.0.0');
    assert.equal(f.state.writes[2].body.target_commitish, f.options.commit);
});
test('GitHub rejects conflicting tags, orphan releases and excessive annotated tag nesting', async () => {
    for (const scenario of ['conflict', 'orphan', 'cycle']) {
        const f = githubFixture();
        if (scenario === 'orphan') f.state.release = {};
        else if (scenario === 'conflict') f.state.ref = { object: { type: 'commit', sha: 'b'.repeat(40) } };
        else {
            f.state.ref = { object: { type: 'tag', sha: 'nested' } };
            f.state.tags.set('nested', f.state.ref);
        }
        await assert.rejects(finalizeRelease(f.options, f.api));
        assert.deepEqual(f.state.writes, []);
    }
});
test('GitHub accepts an annotated tag resolving to the tested commit', async () => {
    const f = githubFixture();
    f.state.ref = { object: { type: 'tag', sha: 'annotated' } };
    f.state.tags.set('annotated', { object: { type: 'commit', sha: f.options.commit } });
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['releases']);
});
test('GitHub lookup failure does not create anything', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async () => { throw new Error('Forbidden'); }), /Forbidden/);
    assert.deepEqual(f.state.writes, []);
});
test('GitHub retry recognizes a release accepted before the response was lost', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async (...args) => {
        const result = await f.api(...args);
        if (args[0] === 'releases' && args[1] === 'POST') throw new Error('response lost');
        return result;
    }), /response lost/);
    await finalizeRelease(f.options, f.api);
    assert.deepEqual(f.state.writes.map(w => w.endpoint), ['git/refs', 'releases']);
});
test('GitHub tag creation failure prevents release creation', async () => {
    const f = githubFixture();
    await assert.rejects(finalizeRelease(f.options, async (...args) => {
        if (args[0] === 'git/refs') throw new Error('tag creation denied');
        return f.api(...args);
    }), /tag creation denied/);
    assert.equal(f.state.release, null);
    assert.deepEqual(f.state.writes, []);
});
